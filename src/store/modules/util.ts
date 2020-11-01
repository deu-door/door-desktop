import produce from "immer";
import { Dispatch } from "redux";
import { Action } from "redux-actions";
import { Fetchable, FetchableMap } from "service/door/interfaces";
import moment from 'moment';
import { RootStateOrAny } from "react-redux";

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
type TimeoutPayload<Params> = { params: Params };
type SuccessPayload<Params, Result> = { params: Params, result: Result };

type PayloadHandler<Params, Result> = {
	pending?: (action: Action<PendingPayload<Params>>, draft: Result) => void,
	failure?: (action: Action<FailurePayload<Params>>, draft: Result) => void,
	success?: (action: Action<SuccessPayload<Params, Result>>, draft: Result) => void
}

type FetchableActionsProps<State, Result, Params> = {
	name: string,
	selector: (state: RootStateOrAny) => State,
	path: (draft: State, params: Params) => Result,
	fetch: (params: Params) => Promise<Result>,
	handler?: PayloadHandler<Params, Result>
};

export function fetchableActions<State, Result extends Fetchable, Params>(props: FetchableActionsProps<State, Result, Params>){
	const { name, selector, path, fetch, handler } = props;

	const [ PENDING, FAILURE, TIMEOUT, SUCCESS ] = ['PENDING', 'FAILURE', 'TIMEOUT', 'SUCCESS'].map(state => name.toUpperCase() + '_' + state);

	const context = {
		PENDING,
		FAILURE,
		TIMEOUT,
		SUCCESS,

		pending: (params: Params) => ({ type: PENDING, payload: { params } }),
		failure: (params: Params, error: Error & string) => ({ type: FAILURE, payload: { params, error } }),
		timeout: (params: Params) => ({ type: TIMEOUT, payload: { params } }),
		success: (params: Params, result: Result) => ({ type: SUCCESS, payload: { params, result } }),

		path: path,
		selector: selector,
		handler: handler || {},

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

		fetchIfExpired: (params: Params, validDuration: moment.Duration|string|number) => async (dispatch: Dispatch, getState: () => State) => {
			if(moment(context.path(context.selector(getState()), params).fetchedAt || 0).add(moment.duration(validDuration)) > moment()) {
				// valid. nothing to do.
				return;
			}

			// fetch
			return context.fetch(params)(dispatch, getState);
		},

		actions: {
			[PENDING]: (state: State, action: Action<PendingPayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				_draft.pending = true;
				_draft.error = undefined;
			}),
			[FAILURE]: (state: State, action: Action<FailurePayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				_draft.pending = false;
				_draft.error = action.payload.error.message || action.payload.error;

				context.handler.failure?.(action, _draft as Result);
			}),
			[TIMEOUT]: (state: State, action: Action<TimeoutPayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				_draft.pending = false;
			}),
			[SUCCESS]: (state: State, action: Action<SuccessPayload<Params, Result>>) => produce(state, draft => {
				const _draft = context.path(draft as State, action.payload.params);

				// Request is cancelled before, i.e. TIMEOUT
				if(_draft.pending === false) return;

				Object.assign(_draft, action.payload.result);

				context.handler.success?.(action, _draft as Result);
			})
		}
	};

	return context;
}

export function fetchableMapActions<State, Result extends Fetchable, Params>(props: FetchableActionsProps<State, FetchableMap<Result>, Params>)
// (
// 	name: string,
// 	path: (draft: State, params: Params) => FetchableMap<Result>,
// 	fetch: (params: Params) => Promise<FetchableMap<Result>>,
// 	handler?: PayloadHandler<Params, FetchableMap<Result>>
// )
{
	const { name, selector, path, fetch, handler } = props;

	const context = fetchableActions<State, FetchableMap<Result>, Params>({
		name: name + '_LIST',
		selector,
		path,
		fetch,
		handler
	});

	// Override success action
	context.actions[context.SUCCESS] = (state: State, action: Action<SuccessPayload<Params, FetchableMap<Result>>>) => produce(state, draft => {
		const _draft = context.path(draft as State, action.payload.params);

		_draft.pending = false;
		_draft.error = undefined;
		_draft.fetchedAt = action.payload.result.fetchedAt;
		_draft.fulfilled = action.payload.result.fulfilled;

		const previousItems = _draft.items;
		_draft.items = {};
		Object.entries(action.payload.result.items).forEach(([id, item]) => {
			_draft.items[id] = Object.assign(previousItems[id] || {}, item);
		});

		context.handler.success?.(action, _draft);
	});

	return context;
}