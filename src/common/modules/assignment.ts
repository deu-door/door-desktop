import { createEntityAdapter, createSlice, isAnyOf } from '@reduxjs/toolkit';
import door from '../door';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { omit } from '../helper/object';
import { assignmentListURI, assignmentURI } from '../uri/uri';
import { WithURI } from '../uri/uri.interfaces';
import {
	Door,
	Assignment,
	HomeworkHead,
	Homework,
	TeamProjectHead,
	ActivityHead,
	Activity,
	TeamProject,
	AssignmentVariant,
	AssignmentHead,
} from 'door-api';
import { reset } from './user';

const adapter = createEntityAdapter<WithURI<AssignmentHead | Assignment>>({
	selectId: assignment => assignment.uri,
});

const initialState = adapter.getInitialState();

const fetchHomeworkList = createDoorAsyncThunk<HomeworkHead[], Parameters<Door['getHomeworkList']>>({
	typePrefix: 'Homework/FetchList',
	getMeta: id => ({ uri: assignmentListURI({ id, variant: AssignmentVariant.HOMEWORK }) }),
	thunk:
		() =>
		(...params) =>
			door.getHomeworkList(...params),
});

const fetchHomework = createDoorAsyncThunk<Homework, Parameters<Door['getHomework']>>({
	typePrefix: 'Homework/FetchDetail',
	getMeta: ({ id }) => ({ uri: assignmentURI({ id, variant: AssignmentVariant.HOMEWORK }) }),
	thunk:
		() =>
		(...params) =>
			door.getHomework(...params),
});

const fetchTeamProjectList = createDoorAsyncThunk<TeamProjectHead[], Parameters<Door['getTeamProjectList']>>({
	typePrefix: 'TeamProject/FetchList',
	getMeta: id => ({ uri: assignmentListURI({ id, variant: AssignmentVariant.TEAM_PROJECT }) }),
	thunk:
		() =>
		(...params) =>
			door.getTeamProjectList(...params),
});

const fetchTeamProject = createDoorAsyncThunk<TeamProject, Parameters<Door['getTeamProject']>>({
	typePrefix: 'TeamProject/FetchDetail',
	getMeta: ({ id }) => ({ uri: assignmentURI({ id, variant: AssignmentVariant.TEAM_PROJECT }) }),
	thunk:
		() =>
		(...params) =>
			door.getTeamProject(...params),
});

const fetchActivityList = createDoorAsyncThunk<ActivityHead[], Parameters<Door['getActivityList']>>({
	typePrefix: 'Activity/FetchList',
	getMeta: id => ({ uri: assignmentListURI({ id, variant: AssignmentVariant.ACTIVITY }) }),
	thunk:
		() =>
		(...params) =>
			door.getActivityList(...params),
});

const fetchActivity = createDoorAsyncThunk<Activity, Parameters<Door['getActivity']>>({
	typePrefix: 'Activity/FetchDetail',
	getMeta: ({ id }) => ({ uri: assignmentURI({ id, variant: AssignmentVariant.ACTIVITY }) }),
	thunk:
		() =>
		(...params) =>
			door.getActivity(...params),
});

const slice = createSlice({
	name: 'assignment',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addMatcher(
				isAnyOf(fetchHomeworkList.fulfilled, fetchTeamProjectList.fulfilled, fetchActivityList.fulfilled),
				(state, { payload: assignments }) => {
					adapter.addMany(
						state,
						assignments.map(assignment => ({
							uri: assignmentURI(assignment),
							...assignment,
						})),
					);

					adapter.updateMany(
						state,
						assignments.map(assignment => ({
							id: assignmentURI(assignment),
							changes: {
								...omit(assignment, 'partial'),
							},
						})),
					);
				},
			)
			.addMatcher(
				isAnyOf(fetchHomework.fulfilled, fetchTeamProject.fulfilled, fetchActivity.fulfilled),
				(state, { payload: assignment }) => {
					adapter.upsertOne(state, { uri: assignmentURI(assignment), ...assignment });
				},
			);
	},
});

const assignment = {
	reducer: slice.reducer,
	actions: {
		fetchHomeworkList,
		fetchHomework,
		fetchTeamProjectList,
		fetchTeamProject,
		fetchActivityList,
		fetchActivity,
		// putSubmission,
	},
	selectors: {
		assignment: adapter.getSelectors(),
	},
};

export default assignment;
