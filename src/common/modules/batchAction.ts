import { AnyAction, createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { BatchActionProgress } from '../batchAction/batchAction.interfaces';
import { batchActionURI } from '../uri/uri';
import { reset } from './user';

const adapter = createEntityAdapter<BatchActionProgress>({
	selectId: progress => progress.id,
});

const initialState = adapter.getInitialState();

const doBatchAction = createDoorAsyncThunk<void, [id: string, actions: AnyAction[]]>({
	typePrefix: 'BatchAction/DoAction',
	getMeta: id => ({ uri: batchActionURI({ id }) }),
	thunk:
		({ dispatch }) =>
		async (id, actions) => {
			dispatch(
				addBatchActionProgress({
					id,
					state: 'progressing',
					total: actions.length,
					current: 0,
					progress: 0,
					message: '잠시만 기다려주세요 ...',
				}),
			);

			let done = 0;
			for (const action of actions) {
				dispatch(
					updateBatchActionProgress({
						id,
						state: 'progressing',
						current: done,
						progress: done / actions.length,
						// eslint-disable-next-line @typescript-eslint/no-explicit-any
						message: action?.meta?.message ?? '로딩중입니다 ...',
					}),
				);
				done += 1;

				await dispatch(action);
			}

			dispatch(
				updateBatchActionProgress({
					id,
					state: 'completed',
					current: actions.length,
					message: '요청한 작업을 완료하였습니다!',
				}),
			);
		},
});

const addBatchActionProgress = createAction<BatchActionProgress>('BatchAction/AddProgress');

const updateBatchActionProgress = createAction<Partial<BatchActionProgress> & Pick<BatchActionProgress, 'id'>>(
	'BatchAction/UpdateProgress',
);

const slice = createSlice({
	name: 'batchAction',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(addBatchActionProgress, (state, { payload: batchActionProgress }) => {
				adapter.upsertOne(state, batchActionProgress);
			})
			.addCase(updateBatchActionProgress, (state, { payload: batchActionProgress }) => {
				adapter.updateOne(state, {
					id: batchActionProgress.id,
					changes: batchActionProgress,
				});
			}),
});

const batchAction = {
	reducer: slice.reducer,
	actions: {
		doBatchAction,
		addBatchActionProgress,
		updateBatchActionProgress,
	},
	selectors: {
		batchAction: adapter.getSelectors(),
	},
};

export default batchAction;
