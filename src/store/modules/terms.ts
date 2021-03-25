import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { ITerm } from 'models/door';
import { persistReducer } from 'redux-persist';
import door from 'services/door';
import { HttpError } from 'services/response';
import { persistedStorage } from 'store/modules/persisted-storage';
import {
	IAsyncThunkState,
	AsyncThunkTransform,
	ResetOnVersionChange,
	toPending,
	toFulfilled,
	toRejectedWithError,
	UserDataTransform,
} from './util';
import { actions as coursesActions } from './courses';
import { reset } from './user';

const termsAdapter = createEntityAdapter<ITerm & IAsyncThunkState>({
	selectId: term => term.id,
});

const initialState = termsAdapter.getInitialState({
	pending: false,
	error: undefined,
	fulfilledAt: undefined,
} as IAsyncThunkState);

const fetchTerms = createAsyncThunk<ITerm[], Parameters<typeof door.getTerms> | undefined, { rejectValue: HttpError }>(
	'terms/fetchTerms',
	async (params, { rejectWithValue }) => {
		try {
			const response = await door.getTerms(...(params ?? []));

			return response.data;
		} catch (e) {
			const error: HttpError = e;
			return rejectWithValue(error);
		}
	},
);

const termsSlice = createSlice({
	name: 'terms',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => {
				Object.assign(state, initialState);
			})
			.addCase(fetchTerms.pending, toPending)
			.addCase(fetchTerms.fulfilled, (state, { payload: terms }) => {
				toFulfilled(state);
				termsAdapter.addMany(
					state,
					terms.map(term => ({
						...term,

						pending: false,
						error: undefined,
						fulfilledAt: undefined,
					})),
				);
			})
			.addCase(fetchTerms.rejected, (state, { payload: error }) => {
				toRejectedWithError(state, error?.message);
			})
			.addCase(coursesActions.fetchCourses.pending, (state, { meta: { arg } }) => {
				const { id } = arg[0];

				termsAdapter.updateOne(state, {
					id: id,
					changes: toPending({}),
				});
			})
			.addCase(coursesActions.fetchCourses.fulfilled, (state, { meta: { arg } }) => {
				const { id } = arg[0];

				termsAdapter.updateOne(state, {
					id: id,
					changes: toFulfilled({}),
				});
			})
			.addCase(coursesActions.fetchCourses.rejected, (state, { payload: error, meta: { arg } }) => {
				const { id } = arg[0];

				termsAdapter.updateOne(state, {
					id: id,
					changes: toRejectedWithError({}, error?.message),
				});
			}),
});

export const reducer = persistReducer(
	{
		key: 'terms',
		storage: persistedStorage,
		transforms: [UserDataTransform, AsyncThunkTransform],
		version: 2,
		migrate: ResetOnVersionChange,
	},
	termsSlice.reducer,
) as typeof termsSlice.reducer;

export const actions = {
	fetchTerms,
};

export const selectors = {
	termsSelector: termsAdapter.getSelectors(),
};
