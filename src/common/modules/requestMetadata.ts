import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { RequestMetadata } from '../request/request.interface';
import { reset } from './user';

const adapter = createEntityAdapter<RequestMetadata>({
	selectId: requestMetadata => requestMetadata.uri,
});

const initialState = adapter.getInitialState();

const updateRequestMetadataPending = createAction('UpdateRequestMetadata/Pending', (uri: string) => ({
	payload: { uri },
}));

const updateRequestMetadataFulfilled = createAction('UpdateRequestMetadata/Fulfilled', (uri: string) => ({
	payload: { uri },
}));

const updateRequestMetadataRejected = createAction(
	'UpdateRequestMetadata/Rejected',
	(uri: string, error: { message: string } | string | undefined) => ({
		payload: { uri, error },
	}),
);

const slice = createSlice({
	name: 'requestMetadata',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(updateRequestMetadataPending, (state, { payload: { uri } }) => {
				// initial state
				adapter.addOne(state, {
					uri,
					pending: true,
					error: undefined,
					fulfilledAt: undefined,
					fulfilled: false,
				});
				adapter.updateOne(state, {
					id: uri,
					changes: {
						pending: true,
						error: undefined,
					},
				});
			})
			.addCase(updateRequestMetadataFulfilled, (state, { payload: { uri } }) => {
				adapter.updateOne(state, {
					id: uri,
					changes: {
						pending: false,
						error: undefined,
						fulfilledAt: new Date().toISOString(),
						fulfilled: true,
					},
				});
			})
			.addCase(updateRequestMetadataRejected, (state, { payload: { uri, error } }) => {
				adapter.updateOne(state, {
					id: uri,
					changes: {
						pending: false,
						error: typeof error === 'string' ? error : error?.message ?? 'Unknown Error',
					},
				});
			}),
});

const requestMetadata = {
	reducer: slice.reducer,
	actions: {
		updateRequestMetadataPending,
		updateRequestMetadataFulfilled,
		updateRequestMetadataRejected,
	},
	selectors: {
		requestMetadata: adapter.getSelectors(),
	},
};

export default requestMetadata;
