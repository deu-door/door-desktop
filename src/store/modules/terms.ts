import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { ITerm } from 'models/door';
import { persistReducer } from 'redux-persist';
import door from 'services/door';
import { HttpError } from 'services/response';
import { persistedStorage } from 'store/modules/persisted-storage';
import { IAsyncThunkState, AsyncThunkTransform, ResetOnVersionChange, toPending, toFulfilled, toRejectedWithError } from './util';

export interface TermsState extends IAsyncThunkState {
	terms: ITerm[];
}

const initialState: TermsState = {
	pending: false,
	error: undefined,
	terms: [],
};

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
	initialState: initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(fetchTerms.pending, toPending)
			.addCase(fetchTerms.fulfilled, (state, { payload: terms }) => {
				toFulfilled(state);
				state.terms = terms;
			})
			.addCase(fetchTerms.rejected, (state, { payload: error }) => {
				toRejectedWithError(state, error?.message);
			}),
});

export const reducer = persistReducer(
	{
		key: 'terms',
		storage: persistedStorage,
		transforms: [AsyncThunkTransform],
		version: 1,
		migrate: ResetOnVersionChange,
	},
	termsSlice.reducer,
) as typeof termsSlice.reducer;

export const actions = {
	fetchTerms,
};
