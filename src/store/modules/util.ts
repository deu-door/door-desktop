import produce, { Draft } from "immer";
import { Dispatch } from "redux";
import { Action } from "redux-actions";
import { Fetchable, FetchableMap } from "service/door/interfaces";

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
type SuccessPayload<Params, Result> = { params: Params, result: Result };

type PayloadHandler<Params, Result> = {
	pending?: (action: Action<PendingPayload<Params>>, draft: Draft<Result>) => void,
	failure?: (action: Action<FailurePayload<Params>>, draft: Draft<Result>) => void,
	success?: (action: Action<SuccessPayload<Params, Result>>, draft: Draft<Result>) => void
}

export function fetchableActions<State, Result extends Fetchable, Params>(
	name: string,
	path: (draft: Draft<State>, params: Params) => Draft<Result>,
	fetch: (params: Params) => Promise<Result>,
	handler?: PayloadHandler<Params, Result>
){
	name = name.toUpperCase();

	const [ PENDING, FAILURE, SUCCESS ] = ['PENDING', 'FAILURE', 'SUCCESS'].map(state => name + '_' + state);

	const context = {
		PENDING,
		FAILURE,
		SUCCESS,

		pending: (params: Params) => ({ type: PENDING, payload: { params } }),
		failure: (params: Params, error: Error & string) => ({ type: FAILURE, payload: { params, error } }),
		success: (params: Params, result: Result) => ({ type: SUCCESS, payload: { params, result } }),

		path: path,
		handler: handler || {},

		_fetch: fetch,

		fetch: <State>(params: Params) => async (dispatch: Dispatch, getState: () => State) => {
			dispatch(context.pending(params));

			try{
				const result = await context._fetch(params);
				dispatch(context.success(params, result));
			}catch(e){
				dispatch(context.failure(params, e));
			}
		},

		actions: {
			[PENDING]: (state: State, action: Action<PendingPayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft, action.payload.params);

				_draft.pending = true;
				_draft.error = undefined;
			}),
			[FAILURE]: (state: State, action: Action<FailurePayload<Params>>) => produce(state, draft => {
				const _draft = context.path(draft, action.payload.params);

				_draft.pending = false;
				_draft.error = action.payload.error.message || action.payload.error;

				context.handler.failure?.(action, _draft);
			}),
			[SUCCESS]: (state: State, action: Action<SuccessPayload<Params, Result>>) => produce(state, draft => {
				const _draft = context.path(draft, action.payload.params);

				Object.assign(_draft, action.payload.result);

				context.handler.success?.(action, _draft);
			})
		}
	};

	return context;
}

export function fetchableMapActions<State, Result extends Fetchable, Params>(
	name: string,
	path: (draft: Draft<State>, params: Params) => Draft<FetchableMap<Result>>,
	fetch: (params: Params) => Promise<FetchableMap<Result>>,
	handler?: PayloadHandler<Params, FetchableMap<Result>>
){
	const context = fetchableActions<State, FetchableMap<Result>, Params>(name + '_LIST', path, fetch, handler);

	// Override success action
	context.actions[context.SUCCESS] = (state: State, action: Action<SuccessPayload<Params, FetchableMap<Result>>>) => produce(state, draft => {
		const _draft = context.path(draft, action.payload.params);

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