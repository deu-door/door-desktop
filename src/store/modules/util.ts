import produce from "immer";
import { Dispatch } from "redux";
import { Action } from "redux-actions";
import { Fetchable, FetchableMap } from "service/door/interfaces";
import moment from 'moment';
import { RootStateOrAny } from "react-redux";
import { FetchableAction } from ".";
import { createMigrate, createTransform, PersistedState, PersistMigrate } from "redux-persist";

export interface AsyncState extends Fetchable {
	pending?: boolean,
	error?: Error|string,
	status?: {
		progress?: number,
		message?: string
	}
}

type PendingPayload<Params> = { params: Params };
type FailurePayload<Params> = { params: Params, error: Error & string };
type ClearPayload<Params> = { params: Params };
type SuccessPayload<Params, Result> = { params: Params, result: Result };

type PayloadHandler<Params, Result> = {
	pending?: (action: Action<PendingPayload<Params>>, draft: Result) => void,
	failure?: (action: Action<FailurePayload<Params>>, draft: Result) => void,
	success?: (action: Action<SuccessPayload<Params, Result>>, draft: Result) => void,
	clear?: (action: Action<ClearPayload<Params>>, draft: Result) => void
}

type FetchableActionsOptions = {
	validDuration?: moment.Duration|string|number
}

type FetchableActionsProps<State, Result, Params> = {
	name: string,
	selector: (state: RootStateOrAny) => State,
	path: (draft: State, params: Params) => Result,
	fetch: (params: Params) => Promise<Result>,
	handler?: PayloadHandler<Params, Result>,
	options?: FetchableActionsOptions
};

export function fetchableActions<State, Result extends Fetchable, Params>(props: FetchableActionsProps<State, Result, Params>){
	const { name, selector, path, fetch, handler, options } = props;

	const [ PENDING, FAILURE, CLEAR, SUCCESS ] = ['PENDING', 'FAILURE', 'CLEAR', 'SUCCESS'].map(state => name.toUpperCase() + '_' + state);

	const context = {
		PENDING,
		FAILURE,
		CLEAR,
		SUCCESS,

		pending: (params: Params) => ({ type: PENDING, payload: { params } }),
		failure: (params: Params, error: Error & string) => ({ type: FAILURE, payload: { params, error } }),
		clear: (params: Params) => ({ type: CLEAR, payload: { params } }),
		success: (params: Params, result: Result) => ({ type: SUCCESS, payload: { params, result } }),

		path: path,
		selector: selector,
		handler: handler,
		options: options,

		_fetch: fetch,

		fetch: (params: Params) => async (dispatch: Dispatch, getState: () => State) => {
			dispatch(context.pending(params));

			try{
				const result = await context._fetch(params);
				dispatch(context.success(params, result));
			}catch(e){
				dispatch(context.failure(params, e));
			}
		},

		fetchIfExpired: (params: Params) => async (dispatch: Dispatch, getState: () => State) => {
			// valid duration is not defined.
			if(!context.options?.validDuration) return;
			
			const fetchedAt = moment(context.path(context.selector(getState()), params).fetchedAt || 0);
			const validDuration = moment.duration(context.options.validDuration);

			// Fetched data was expired, nothing to do.
			if(fetchedAt.add(validDuration) > moment()) return;

			// fetch
			return context.fetch(params)(dispatch, getState);
		},

		fetchIfNotFulfilled: (params: Params) => async (dispatch: Dispatch, getState: () => State) => {
			// Already fulfilled, nothing to do.
			if(context.path(context.selector(getState()), params).fulfilled) return;

			// fetch
			return context.fetch(params)(dispatch, getState);
		},

		actions: (params: Params): FetchableAction => ({
			fetch: () => context.fetch(params),
			fetchIfExpired: () => context.fetchIfExpired(params),
			fetchIfNotFulfilled: () => context.fetchIfNotFulfilled(params),
			clear: () => context.clear(params)
		}),

		reduxActions: {
			[PENDING]: (state: State, action: Action<PendingPayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				_draft.pending = true;
				_draft.error = undefined;
			}),
			[FAILURE]: (state: State, action: Action<FailurePayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				_draft.pending = false;
				_draft.error = action.payload.error.message || action.payload.error;

				console.error('Error occured while process redux action.');
				console.error('action: ' + FAILURE);
				console.error('error: ', action.payload.error);

				context.handler?.failure?.(action, _draft as Result);
			}),
			[CLEAR]: (state: State, action: Action<ClearPayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				_draft.pending = false;
				_draft.error = undefined;

				context.handler?.clear?.(action, _draft as Result);
			}),
			[SUCCESS]: (state: State, action: Action<SuccessPayload<Params, Result>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				// Request is cancelled before, i.e. TIMEOUT
				if(_draft.pending === false) return;

				Object.assign(_draft, action.payload.result);

				context.handler?.success?.(action, _draft as Result);
			})
		}
	};

	return context;
}

export function fetchableMapActions<State, Result extends Fetchable, Params>(props: FetchableActionsProps<State, FetchableMap<Result>, Params>) {
	const { name, selector, path, fetch, handler, options } = props;

	const context = fetchableActions<State, FetchableMap<Result>, Params>({
		name: name + '_LIST',
		selector,
		path,
		fetch,
		handler,
		options
	});

	// Override success action
	context.reduxActions[context.SUCCESS] = (state: State, action: Action<SuccessPayload<Params, FetchableMap<Result>>>) => produce(state, draft => {
		const _draft = context.path(draft as State, action.payload.params);

		const previousItems = _draft.items;

		// Merge result properties
		Object.assign(_draft, action.payload.result);

		_draft.items = {};
		Object.entries(action.payload.result.items).forEach(([id, item]) => {
			// Only add new
			if(previousItems[id]?.fulfilled) {
				_draft.items[id] = previousItems[id];

			// New item found
			}else {
				_draft.items[id] = Object.assign(previousItems[id] || {}, item);
			}

			// // fulfilled is once true, it never fall back to false
			// _draft.items[id].fulfilled = previousItems[id]?.fulfilled || item.fulfilled;
		});

		_draft.pending = false;
		_draft.error = undefined;
		_draft.fetchedAt = action.payload.result.fetchedAt;
		_draft.fulfilled = action.payload.result.fulfilled;

		context.handler?.success?.(action, _draft);
	});

	return context;
}

export const FetchableTransform = createTransform(
	// transform state on its way to being serialized and persisted.
	(inboundState, key) => {
		if(key === 'pending') return false;

		return inboundState;
	},
	// transform state being rehydrated
	(outboundState, key) => {
		if(key === 'pending') return false;
		
		return outboundState;
	}
);

export const ResetOnVersionChange = (): PersistMigrate => {
	return createMigrate({
		// No migration yet. Data will be reseted when version change.
		1: (state) => undefined
	}, { debug: true });
}