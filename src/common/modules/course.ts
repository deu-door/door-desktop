import { Door, Course, CourseSyllabus } from 'door-api';
import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import door from '../door';
import { courseListURI, courseSyllabusURI } from '../uri/uri';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { reset } from './user';

const adapter = createEntityAdapter<Course>({
	selectId: course => course.id,
});

const initialState = adapter.getInitialState();

const fetchCourseList = createDoorAsyncThunk<Course[], Parameters<Door['getCourseList']>>({
	typePrefix: 'Course/FetchList',
	getMeta: id => ({ uri: courseListURI({ id }) }),
	thunk:
		() =>
		(...params) =>
			door.getCourseList(...params),
});

const fetchCourseSyllabus = createDoorAsyncThunk<CourseSyllabus, Parameters<Door['getCourseSyllabus']>>({
	typePrefix: 'Course/FetchSyllabus',
	getMeta: id => ({ uri: courseSyllabusURI({ id }) }),
	thunk:
		() =>
		(...params) =>
			door.getCourseSyllabus(...params),
});

const slice = createSlice({
	name: 'course',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(fetchCourseList.fulfilled, (state, { payload: courses }) => {
				adapter.upsertMany(state, courses);
			})
			.addCase(fetchCourseSyllabus.fulfilled, (state, { payload: syllabus }) => {
				adapter.updateOne(state, {
					id: syllabus.id,
					changes: { syllabus },
				});
			}),
});

const course = {
	reducer: slice.reducer,
	actions: {
		fetchCourseList,
		fetchCourseSyllabus,
	},
	selectors: {
		course: adapter.getSelectors(),
	},
};

export default course;
