import produce from 'immer';
import { Dispatch } from 'redux';
import { Action } from 'redux-actions';
import { Fetchable, FetchableMap } from 'services/door/interfaces';
import moment from 'moment';
import { RootStateOrAny } from 'react-redux';
import { FetchableAction } from '.';
import { createMigrate, createTransform, PersistMigrate } from 'redux-persist';

export interface AsyncState extends Fetchable {
	pending?: boolean;
	error?: Error | string;
	status?: {
		progress?: number;
		message?: string;
	};
}

type PendingPayload<Params> = { params: Params };
type FailurePayload<Params> = { params: Params; error: Error & string };
type ClearPayload<Params> = { params: Params };
type SuccessPayload<Params, Result> = { params: Params; result: Result };

type PayloadHandler<Params, Result> = {
	pending?: (action: Action<PendingPayload<Params>>, draft: Result) => void;
	failure?: (action: Action<FailurePayload<Params>>, draft: Result) => void;
	success?: (
		action: Action<SuccessPayload<Params, Result>>,
		draft: Result,
	) => void;
	clear?: (action: Action<ClearPayload<Params>>, draft: Result) => void;
};

type FetchableActionsOptions = {
	validDuration?: moment.Duration | string | number;
};

interface FetchableActionsProps<State, Result, Params> {
	name: string;
	selector: (state: RootStateOrAny) => State;
	path: (draft: State, params: Params) => Result;
	fetch: (params: Params) => Promise<Result>;
	handler?: PayloadHandler<Params, Result>;
	options?: FetchableActionsOptions;
}

export function fetchableActions<
	State,
	Result extends Fetchable,
	Params = undefined,
	Props extends FetchableActionsProps<
		State,
		Result,
		Params
	> = FetchableActionsProps<State, Result, Params>
>(props: Props) {
	const { name, selector, path, fetch, handler, options } = props;

	const [PENDING, FAILURE, CLEAR, SUCCESS] = [
		'PENDING',
		'FAILURE',
		'CLEAR',
		'SUCCESS',
	].map(state => name.toUpperCase() + '_' + state);

	const context = {
		PENDING,
		FAILURE,
		CLEAR,
		SUCCESS,

		pending: (params: Params) => ({ type: PENDING, payload: { params } }),
		failure: (params: Params, error: Error & string) => ({
			type: FAILURE,
			payload: { params, error },
		}),
		clear: (params: Params) => ({ type: CLEAR, payload: { params } }),
		success: (params: Params, result: Result) => ({
			type: SUCCESS,
			payload: { params, result },
		}),

		path: path,
		selector: selector,
		handler: handler,
		options: options,

		_fetch: fetch,

		fetch: (params: Params) => async (
			dispatch: Dispatch,
			getState: () => State,
		) => {
			// prevent fetch when pending status
			if (context.path(context.selector(getState()), params).pending)
				return;

			dispatch(context.pending(params));

			try {
				const result = await context._fetch(params);
				dispatch(context.success(params, result));
			} catch (e) {
				dispatch(context.failure(params, e));
			}
		},

		fetchIfExpired: (params: Params) => async (
			dispatch: Dispatch,
			getState: () => State,
		) => {
			// valid duration is not defined.
			if (!context.options?.validDuration) return;

			const fetchedAt = moment(
				context.path(context.selector(getState()), params).fetchedAt ||
					0,
			);
			const validDuration = moment.duration(
				context.options.validDuration,
			);

			// Fetched data was not expired yet, nothing to do.
			if (fetchedAt.add(validDuration) > moment()) return;

			// fetch
			return context.fetch(params)(dispatch, getState);
		},

		fetchIfNotFulfilled: (params: Params) => async (
			dispatch: Dispatch,
			getState: () => State,
		) => {
			// Already fulfilled, nothing to do.
			if (context.path(context.selector(getState()), params).fulfilled)
				return;

			// fetch
			return context.fetch(params)(dispatch, getState);
		},

		actions: (params: Params): FetchableAction => ({
			fetch: () => context.fetch(params),
			fetchIfExpired: () => context.fetchIfExpired(params),
			fetchIfNotFulfilled: () => context.fetchIfNotFulfilled(params),
			clear: () => context.clear(params),
		}),

		reduxActions: {
			[PENDING]: (state: State, action: Action<PendingPayload<Params>>) =>
				produce(state, draft => {
					const _draft = context.path(
						draft as State,
						action.payload.params,
					);

					_draft.pending = true;
					_draft.error = undefined;
				}),
			[FAILURE]: (state: State, action: Action<FailurePayload<Params>>) =>
				produce(state, draft => {
					const _draft = context.path(
						draft as State,
						action.payload.params,
					);

					_draft.pending = false;
					_draft.error =
						action.payload.error.message || action.payload.error;

					console.error('Error occured while process redux action.');
					console.error('action: ' + FAILURE);
					console.error('error: ', action.payload.error);

					context.handler?.failure?.(action, _draft as Result);
				}),
			[CLEAR]: (state: State, action: Action<ClearPayload<Params>>) =>
				produce(state, draft => {
					const _draft = context.path(
						draft as State,
						action.payload.params,
					);

					_draft.pending = false;
					_draft.error = undefined;

					context.handler?.clear?.(action, _draft as Result);
				}),
			[SUCCESS]: (
				state: State,
				action: Action<SuccessPayload<Params, Result>>,
			) =>
				produce(state, draft => {
					const _draft = context.path(
						draft as State,
						action.payload.params,
					);

					// Request is cancelled before, i.e. TIMEOUT
					if (_draft.pending === false) return;

					Object.assign(_draft, action.payload.result);

					context.handler?.success?.(action, _draft as Result);
				}),
		},
	};

	return context;
}

interface FetchableMapActionsOptions<Result> extends FetchableActionsOptions {
	/**
	 * FetchableMapActions에 의해 override될 수 있는 item의 property 설정
	 */
	overrideItemProperties?: Array<keyof Result>;
}

type FetchableMapActionsProps<State, Result, Params> = FetchableActionsProps<
	State,
	FetchableMap<Result>,
	Params
> & {
	options?: FetchableMapActionsOptions<Result>;
};

export function fetchableMapActions<
	State,
	Result extends Fetchable,
	Params = undefined,
	Props extends FetchableMapActionsProps<
		State,
		Result,
		Params
	> = FetchableMapActionsProps<State, Result, Params>
>(props: Props) {
	const { name, selector, path, fetch, handler, options } = props;

	const context = fetchableActions<
		State,
		FetchableMap<Result>,
		Params,
		FetchableMapActionsProps<State, Result, Params>
	>({
		name: name + '_LIST',
		selector,
		path,
		fetch,
		handler,

		// Default variables
		options,
	});

	// Override success action
	context.reduxActions[context.SUCCESS] = (
		state: State,
		action: Action<SuccessPayload<Params, FetchableMap<Result>>>,
	) =>
		produce(state, draft => {
			const _draft = context.path(draft as State, action.payload.params);

			const previousItems = _draft.items;
			const nextItems = action.payload.result.items;

			// Merge result properties
			Object.assign(_draft, action.payload.result);

			_draft.items = {};
			Object.entries(nextItems).forEach(([id, nextItem]) => {
				// 원래 item들의 properties들은 개별적으로 fetch되어 데이터를 가지지만
				// fetchableMap에서 개별 item들의 데이터를 가지게 될 수도 있음
				//
				// 예를 들어 특정 게시물은 목록을 가져왔을 땐 createdAt은 시각을 표시하지 않지만
				// 게시물 내용을 가져오면 createdAt은 시각을 표시한다
				// 이러한 경우 children 즉 개별 데이터를 우선시해야하며
				//
				// 특정 경우에는 목록에서 가져온 데이터가 우선시되어야 할 때도 있다.
				// 이를 overrideItemProperties를 통해 설정 가능하다.

				const previousItem = previousItems[id];

				// 새로운 아이템을 발견한 경우 추가
				if (!previousItems[id]?.fulfilled) {
					_draft.items[id] = Object.assign(
						previousItem || {},
						nextItem,
					);
				}

				// 이미 개별 데이터가 채워진 경우 건들지 않는다.
				else {
					// 비어 있는 property가 있다면 채우기
					_draft.items[id] = Object.assign(
						{},
						nextItem,
						previousItem,
					);
				}

				// overrideItemProperties에 정의된 프로퍼티들에 대해 override 하기
				options?.overrideItemProperties?.forEach(property => {
					if (nextItem[property]) {
						_draft.items[id][property] = nextItem[property];
					} else if (previousItem) {
						_draft.items[id][property] = previousItem[property];
					}
				});
			});

			_draft.pending = false;
			_draft.error = undefined;
			_draft.fetchedAt = action.payload.result.fetchedAt;
			_draft.fulfilled = action.payload.result.fulfilled;

			context.handler?.success?.(action, _draft);
		});

	return context;
}

type InOrOutboundState = Record<string, unknown>;

const transformNestedFetchable = (fetchable: InOrOutboundState) => {
	fetchable.pending = false;

	Object.entries(fetchable).forEach(([key, value]) => {
		if (!(value instanceof Object)) return;

		if (key === 'items') {
			Object.entries(value).forEach(([id, item]) => {
				if (item instanceof Object && 'pending' in item) {
					(value as InOrOutboundState)[id] = transformNestedFetchable(
						item,
					);
				}
			});
		} else if ('pending' in value) {
			fetchable[key] = transformNestedFetchable(value);
		}
	});

	return fetchable;
};

export const FetchableTransform = createTransform(
	// transform state on its way to being serialized and persisted.
	(inboundState, key) => {
		return inboundState;
	},
	// transform state being rehydrated
	(outboundState, key) => {
		if (key === 'items') transformNestedFetchable({ [key]: outboundState });

		return outboundState;
	},
);

export const ResetOnVersionChange = (): PersistMigrate => {
	return createMigrate(
		{
			// No migration yet. Data will be reseted when version change.
			...Object.fromEntries(
				new Array(100).fill(0).map((d, i) => [i, state => undefined]),
			),
		},
		{ debug: true },
	);
};
