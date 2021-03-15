import door from 'services/door';
import { persistedStorage } from 'store/modules/persisted-storage';
import { persistReducer } from 'redux-persist';
import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { ICourse, ICourseSyllabus } from 'models/door';
import { IAsyncThunkState, AsyncThunkTransform, ResetOnVersionChange, toRejectedWithError, toPending, toFulfilled } from './util';
import { HttpError } from 'services/response';

const coursesAdapter = createEntityAdapter<ICourse & IAsyncThunkState>({
	selectId: course => course.id,
});

const initialState = coursesAdapter.getInitialState({
	pending: false,
	error: undefined,
} as IAsyncThunkState);

const fetchCourses = createAsyncThunk<ICourse[], Parameters<typeof door.getCourses>, { rejectValue: HttpError }>(
	'courses/fetchCourses',
	async (params, { rejectWithValue }) => {
		try {
			const response = await door.getCourses(...params);

			return response.data;
		} catch (e) {
			const error: HttpError = e;
			return rejectWithValue(error);
		}
	},
);

const fetchCourseSyllabus = createAsyncThunk<ICourseSyllabus, Parameters<typeof door.getCourseSyllabus>, { rejectValue: HttpError }>(
	'courses/fetchSyllabus',
	async (params, { rejectWithValue }) => {
		try {
			const response = await door.getCourseSyllabus(...params);

			return response.data;
		} catch (e) {
			const error: HttpError = e;
			return rejectWithValue(error);
		}
	},
);

const coursesSlice = createSlice({
	name: 'courses',
	initialState: initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(fetchCourses.pending, state => {
				state.pending = true;
				state.error = undefined;
			})
			.addCase(fetchCourses.fulfilled, (state, { meta: { arg }, payload: courses }) => {
				const [{ id: termId }] = arg;
				state.pending = false;

				coursesAdapter.removeMany(
					state,
					coursesAdapter
						.getSelectors()
						.selectAll(state)
						.filter(course => course.termId === termId && courses.find(it => it.id === course.id) === undefined)
						.map(course => course.id),
				);

				coursesAdapter.upsertMany(
					state,
					// each course gets its own async state
					courses.map(course => ({
						// use previous values
						//...(coursesAdapter.getSelectors().selectById(state, course.id) ?? {}),

						...course,

						pending: false,
						error: undefined,
					})),
				);
			})
			.addCase(fetchCourses.rejected, (state, { payload: error }) => {
				toRejectedWithError(state, error?.message);
			})
			.addCase(fetchCourseSyllabus.pending, (state, { meta: { arg } }) => {
				const [course] = arg;
				coursesAdapter.updateOne(state, {
					id: course.id,
					changes: toPending({}),
				});
			})
			.addCase(fetchCourseSyllabus.fulfilled, (state, { meta: { arg }, payload: syllabus }) => {
				const [course] = arg;
				coursesAdapter.updateOne(state, {
					id: course.id,
					changes: {
						...toFulfilled({}),

						syllabus: syllabus,
					},
				});
			})
			.addCase(fetchCourseSyllabus.rejected, (state, { meta: { arg }, payload: error }) => {
				const [course] = arg;
				coursesAdapter.updateOne(state, {
					id: course.id,
					changes: toRejectedWithError({}, error?.message),
				});
			}),
});

export const reducer = persistReducer(
	{
		key: 'courses',
		storage: persistedStorage,
		transforms: [AsyncThunkTransform],
		version: 4,
		migrate: ResetOnVersionChange,
	},
	coursesSlice.reducer,
) as typeof coursesSlice.reducer;

export const actions = {
	fetchCourses,
	fetchCourseSyllabus,
};

export const selectors = {
	coursesSelectors: coursesAdapter.getSelectors(),
};
