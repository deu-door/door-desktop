import { createAsyncThunk, createEntityAdapter, createSlice, isRejected } from '@reduxjs/toolkit';
import { ICourse, ILecture } from 'models/door';
import { ILectureProgress } from 'models/door/lecture/lecture-progress';
import { persistReducer } from 'redux-persist';
import door from 'services/door';
import { HttpError } from 'services/response';
import { persistedStorage } from 'store/modules/persisted-storage';
import { reset } from './user';
import { IAsyncThunkState, AsyncThunkTransform, ResetOnVersionChange, toPending, toFulfilled, toRejectedWithError } from './util';

type LecturesState = Pick<ICourse, 'id'> &
	IAsyncThunkState & {
		lectures: ILecture[];
	};

const lecturesAdapter = createEntityAdapter<LecturesState>({
	selectId: state => state.id,
});

const initialState = lecturesAdapter.getInitialState();

const fetchLectures = createAsyncThunk<ILecture[], Parameters<typeof door.getLectures>[0], { rejectValue: HttpError }>(
	'lectures/fetchLectures',
	async (params, { rejectWithValue }) => {
		try {
			const response = await door.getLectures(params);

			return response.data;
		} catch (e) {
			const error: HttpError = e;

			return rejectWithValue(error);
		}
	},
);

const fetchLectureProgresses = createAsyncThunk<
	ILectureProgress[],
	Parameters<typeof door.getLectureProgresses>[0],
	{ rejectValue: HttpError }
>('lectures/fetchProgresses', async (params, { rejectWithValue }) => {
	try {
		const response = await door.getLectureProgresses(params);

		return response.data;
	} catch (e) {
		const error: HttpError = e;

		return rejectWithValue(error);
	}
});

const lecturesSlice = createSlice({
	name: 'lectures',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => {
				Object.assign(state, initialState);
			})
			.addCase(fetchLectures.pending, (state, { meta: { arg } }) => {
				const { id: courseId } = arg;

				lecturesAdapter.addOne(state, {
					id: courseId,
					error: undefined,
					pending: false,
					fulfilledAt: undefined,
					lectures: [],
				});

				lecturesAdapter.updateOne(state, {
					id: courseId,
					changes: toPending({}),
				});
			})
			.addCase(fetchLectures.fulfilled, (state, { payload: lectures, meta: { arg } }) => {
				const { id: courseId } = arg;

				const byWeekTag = Object.fromEntries(
					lecturesAdapter
						.getSelectors()
						.selectById(state, courseId)
						?.lectures.map(lecture => [lecture.week + '-' + lecture.period, lecture]) || [],
				);

				lecturesAdapter.updateOne(state, {
					id: courseId,
					changes: {
						lectures: lectures.map(lecture => ({
							...byWeekTag[lecture.week + '-' + lecture.period],

							...lecture,
						})),

						...toFulfilled({}),
					},
				});
			})
			.addCase(fetchLectureProgresses.fulfilled, (state, { payload: lectureProgresses, meta: { arg } }) => {
				const { id: courseId } = arg;

				const byWeekTag = Object.fromEntries(
					lectureProgresses.map(lectureProgress => [lectureProgress.week + '-' + lectureProgress.period, lectureProgress]),
				);

				lecturesAdapter.updateOne(state, {
					id: courseId,
					changes: {
						lectures: lecturesAdapter
							.getSelectors()
							.selectById(state, courseId)
							?.lectures.map(lecture => ({
								...lecture,

								progress: byWeekTag[lecture.week + '-' + lecture.period],
							})),
					},
				});
			})
			.addMatcher(isRejected(fetchLectures, fetchLectureProgresses), (state, { payload: error, meta: { arg } }) => {
				const { id: courseId } = arg;

				lecturesAdapter.updateOne(state, {
					id: courseId,
					changes: toRejectedWithError({}, error?.message),
				});
			}),
});

export const reducer = persistReducer(
	{
		key: 'posts',
		storage: persistedStorage,
		transforms: [AsyncThunkTransform],
		version: 1,
		migrate: ResetOnVersionChange,
	},
	lecturesSlice.reducer,
) as typeof lecturesSlice.reducer;

export const actions = {
	fetchLectures,
	fetchLectureProgresses,
};

export const selectors = {
	lecturesSelectors: lecturesAdapter.getSelectors(),
};
