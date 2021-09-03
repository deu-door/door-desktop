import { createAction, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import door from '../door';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { lectureListURI, lectureProgressListURI, lectureURI } from '../uri/uri';
import { WithURI } from '../uri/uri.interfaces';
import { Door, Lecture, LectureProgress } from 'door-api';
import { reset } from './user';

const adapter = createEntityAdapter<WithURI<{ lecture: Lecture; progress: LectureProgress | undefined }>>({
	selectId: state => state.uri,
});

const initialState = adapter.getInitialState();

const fetchLectureList = createDoorAsyncThunk<Lecture[], Parameters<Door['getLectureList']>>({
	typePrefix: 'Lecture/FetchList',
	getMeta: id => ({ uri: lectureListURI({ id }) }),
	thunk:
		() =>
		(...params) =>
			door.getLectureList(...params),
});

const fetchLectureProgressList = createDoorAsyncThunk<LectureProgress[], Parameters<Door['getLectureProgressList']>>({
	typePrefix: 'Lecture/FetchProgressList',
	getMeta: id => ({ uri: lectureProgressListURI({ id }) }),
	thunk:
		() =>
		(...params) =>
			door.getLectureProgressList(...params),
});

const openLecture = createAction('Lecture/Open', (uri: string) => ({
	payload: uri,
	meta: { scope: 'local' }, // electron-redux: do not propagate this action to renderer process
}));

const slice = createSlice({
	name: 'lecture',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(fetchLectureList.fulfilled, (state, { payload: lectureList }) => {
				adapter.addMany(
					state,
					lectureList.map(lecture => ({
						uri: lectureURI(lecture),
						lecture: lecture,
						progress: undefined,
					})),
				);

				adapter.updateMany(
					state,
					lectureList.map(lecture => ({
						id: lectureURI(lecture),
						changes: {
							lecture: lecture,
						},
					})),
				);
			})
			.addCase(fetchLectureProgressList.fulfilled, (state, { payload: lectureProgressList }) => {
				adapter.updateMany(
					state,
					lectureProgressList.map(lectureProgress => ({
						id: lectureURI(lectureProgress),
						changes: {
							progress: lectureProgress,
						},
					})),
				);
			})
			.addCase(openLecture, (state, { payload: uri }) => {
				const { lecture } = adapter.getSelectors().selectById(state, uri) ?? {};

				if (lecture !== undefined) {
					// ONLY main process
					import('../../main/windows/lecture').then(({ createLectureWindow }) => createLectureWindow(lecture));
				}
			}),
});

const lecture = {
	reducer: slice.reducer,
	actions: {
		fetchLectureList,
		fetchLectureProgressList,
		openLecture,
	},
	selectors: {
		lecture: adapter.getSelectors(),
	},
};

export default lecture;
