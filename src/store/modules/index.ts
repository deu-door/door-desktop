import produce, { Draft } from "immer";
import { Dispatch } from "redux";
import { Action } from "redux-actions";
import { Fetchable, FetchableMap, Identifiable } from "service/door/interfaces";

export interface AsyncState extends Fetchable {
	pending?: boolean,
	error?: Error|string,
	status?: {
		progress?: number,
		message?: string
	}
}

type AsyncActions<State, Payload> = { [key in 'pending' | 'failure' | 'success' | 'default']?: (state: State, action: Action<Payload>) => State };

export function asyncActions<State extends AsyncState, Payload>(
	name: string,
	actions: AsyncActions<State, Payload>
){
	name = name.toUpperCase();

	return {
		pending: (payload?: Payload) => ({ type: `${name}_PENDING`, payload: payload }),
		failure: (payload?: Payload) => ({ type: `${name}_FAILURE`, payload: payload }),
		success: (payload?: Payload) => ({ type: `${name}_SUCCESS`, payload: payload }),
		
		handler: () => (actions => ({
			[`${name}_PENDING`]: (state: State, action: Action<Payload>): State => {
				const newState = actions.pending ? actions.pending(state, action)
								: actions.default ? actions.default(state, action)
								: { ...state } as State;

				return MutateState.pending(newState) as State;
			},

			[`${name}_FAILURE`]: (state: State, action: Action<Payload & Error & string>): State => {
				const newState = actions.failure ? actions.failure(state, action)
								: actions.default ? actions.default(state, action)
								: { ...state } as State;

				return MutateState.failure(newState) as State;
			},

			[`${name}_SUCCESS`]: (state: State, action: Action<Payload>): State => {
				const newState = actions.success ? actions.success(state, action)
								: actions.default ? actions.default(state, action)
								: { ...state } as State;

				return MutateState.success(newState) as State;
			}
		}))(actions)
	};
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

function insert<T extends Identifiable>(array: T[], item: T): T[] {
	let index = array.length;
	for(let i = 0; i < array.length; i++){
		if(array[i].id === item.id){
			index = i;
			break;
		}
	}
	return [
		...array.slice(0, index),
		item,
		...array.slice(index)
	]
}

function update<T extends Identifiable>(array: T[], newItem: T): T[] {
	return array.map(itemCompare => {
		// This is the one we want
		if(newItem.id === itemCompare.id) return newItem;

		// Otherwise, this isn't the item we care about
		return itemCompare;
	});
}

function find<T extends Identifiable>(array: T[], item: T): T | undefined {
	return array.find(itemCompare => itemCompare.id === item.id);
}

function findAndUpdate<T extends Identifiable>(array: T[], partOfItem: T): T[] {
	return array.map(itemCompare => {
		// Find and insert new fields and data
		if(partOfItem.id === itemCompare.id) return { ...itemCompare, ...partOfItem };

		return itemCompare;
	});
}

function indexOf<T extends Identifiable>(array: T[], findItem: T): number {
	for(let i = 0; i < array.length; i++){
		if(findItem.id === array[i].id) return i;
	}
	return -1;
}

export const Util = {
	insert, update, find, findAndUpdate, indexOf
};

export const MutateState = {
	pending: (fetchable: Fetchable): Fetchable => {
		fetchable.pending = true;
		fetchable.error = undefined;
		return fetchable;
	},
	failure: (fetchable: Fetchable): Fetchable => {
		fetchable.pending = false;
		return fetchable;
	},
	success: (fetchable: Fetchable): Fetchable => {
		fetchable.pending = false;
		fetchable.error = undefined;
		fetchable.fetchedAt = new Date();
		return fetchable;
	}
}