import { handleActions } from 'redux-actions';
import { FetchableMap, ID } from 'service/door/interfaces';
import { Course, initializeCourse } from 'service/door/interfaces/course';
import { Lecture, LecturesByWeek } from 'service/door/interfaces/lecture';
import { Notice } from 'service/door/interfaces/notice';
import { AsyncState, fetchableActions, fetchableMapActions, FetchableTransform, ResetOnVersionChange } from './util';
import door from 'service/door';
import { storage } from 'store/storage';
import moment from 'moment';
import { persistReducer } from 'redux-persist';
import { FetchableAction } from '.';
import { Reference } from 'service/door/interfaces/reference';
import { Activity } from 'service/door/interfaces/activity';
import { TeamProject } from 'service/door/interfaces/team-project';
import { Assignment } from 'service/door/interfaces/assignment';

export interface CourseState extends FetchableMap<Course>, AsyncState {
	categories: string[],
	itemsByCategory: { [key: string]: Course[] }
}

const initialState: CourseState = {
	fulfilled: false,
	pending: false,

	categories: [],
	itemsByCategory: {},
	items: {}
}

const courseMapActions = fetchableMapActions<CourseState, Course, void>({
	name: 'COURSE',
	selector: state => state.courses,
	path: (draft) => draft,
	fetch: door.getCourses,
	handler: {
		success: (action, draft) => {
			// Initialize Course
			Object.values(draft.items).forEach(course => {
				Object.assign(course, initializeCourse(), course);
			});

			// Make category by course.type
			const categories = Array.from(new Set(Object.values(action.payload.result.items).map(course => course.type))).sort((a, b) => {
				const [ a_, b_ ] = [a,b].map(word =>
					// calculate cost (sort priority) of type
					(word.includes('전공') ? 2 : -2)
					+ (word.includes('필수') ? 1 : 0)
					+ (word.includes('선택') ? -1 : 0)
					+ (word.includes('교양') ? 1 : -1)
					+ (word.includes('공통') ? -1 : 0));
	
				return b_ - a_;
			});
	
			const itemsByCategory: { [key: string]: Course[] } = {};
			categories.forEach(category => itemsByCategory[category] = []);
			Object.values(action.payload.result.items).forEach(course => itemsByCategory[course.type].push(course));
	
			(draft as CourseState).categories = categories;
			(draft as CourseState).itemsByCategory = itemsByCategory;
		}
	},
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

const courseActions = fetchableActions<CourseState, Course, ID>({
	name: 'COURSE',
	selector: state => state.courses,
	path: (draft, id) => draft.items[id],
	fetch: id => door.getCourseDetail(id),
	options: {
		validDuration: moment.duration(1, 'days')
	}
});

const noticeMapActions = fetchableMapActions<CourseState, Notice, ID>({
	name: 'NOTICE',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].notices,
	fetch: courseId => door.getNotices(courseId),
	options: {
		overrideItemProperties: ['title', 'author', 'views'],
		validDuration: moment.duration(1, 'hour')
	}
});

const noticeActions = fetchableActions<CourseState, Notice, { courseId: ID, id: ID }>({
	name: 'NOTICE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].notices.items[id],
	fetch: ({ courseId, id }) => door.getNotice(courseId, id),
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

const lectureMapActions = fetchableMapActions<CourseState, LecturesByWeek, ID>({
	name: 'LECTURE',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].lectures,
	fetch: courseId => door.getLectures(courseId),
	options: {
		overrideItemProperties: ['description', 'remark', 'views', 'count', 'period'],
		validDuration: moment.duration(1, 'hour')
	}
});

const lectureActions = fetchableActions<CourseState, FetchableMap<Lecture>, { courseId: ID, id: ID }>({
	name: 'LECTURE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].lectures.items[id],
	fetch: ({ courseId, id}) => door.getLecturesByWeek(courseId, id),
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

const assignmentMapActions = fetchableMapActions<CourseState, Assignment, ID>({
	name: 'ASSIGNMENT',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].assignments,
	fetch: courseId => door.getAssignments(courseId),
	options: {
		overrideItemProperties: ['title', 'period', 'submitted'],
		validDuration: moment.duration(1, 'hour')
	}
});

const assignmentActions = fetchableActions<CourseState, Assignment, { courseId: ID, id: ID }>({
	name: 'ASSIGNMENT',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].assignments.items[id],
	fetch: ({ courseId, id }) => door.getAssignment(courseId, id),
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

const referenceMapActions = fetchableMapActions<CourseState, Reference, ID>({
	name: 'REFERENCE',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].references,
	fetch: courseId => door.getReferences(courseId),
	options: {
		overrideItemProperties: ['title', 'author', 'views'],
		validDuration: moment.duration(1, 'hour')
	}
});

const referenceActions = fetchableActions<CourseState, Reference, { courseId: ID, id: ID }>({
	name: 'REFERENCE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].references.items[id],
	fetch: ({ courseId, id }) => door.getReference(courseId, id),
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

const activityMapActions = fetchableMapActions<CourseState, Activity, ID>({
	name: 'ACTIVITY',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].activities,
	fetch: courseId => door.getActivities(courseId),
	options: {
		overrideItemProperties: ['title', 'period'],
		validDuration: moment.duration(1, 'hour')
	}
});

const activityActions = fetchableActions<CourseState, Activity, { courseId: ID, id: ID }>({
	name: 'ACTIVITY',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].activities.items[id],
	fetch: ({ courseId, id }) => door.getActivity(courseId, id),
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

const teamProjectMapActions = fetchableMapActions<CourseState, TeamProject, ID>({
	name: 'TEAM_PROJECT',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].teamProjects,
	fetch: courseId => door.getTeamProjects(courseId),
	options: {
		overrideItemProperties: ['title', 'period', 'submitted'],
		validDuration: moment.duration(1, 'hour')
	}
});

const teamProjectActions = fetchableActions<CourseState, TeamProject, { courseId: ID, id: ID }>({
	name: 'TEAM_PROJECT',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].teamProjects.items[id],
	fetch: ({ courseId, id }) => door.getTeamProject(courseId, id),
	options: {
		validDuration: moment.duration(1, 'hour')
	}
});

export default persistReducer(
	{
		key: 'courses',
		storage: storage,
		transforms: [FetchableTransform],
		version: 2,
		migrate: ResetOnVersionChange()
	},
	handleActions<CourseState, any>({
		...courseMapActions.reduxActions,
		...courseActions.reduxActions,
		...noticeMapActions.reduxActions,
		...noticeActions.reduxActions,
		...lectureMapActions.reduxActions,
		...lectureActions.reduxActions,
		...assignmentMapActions.reduxActions,
		...assignmentActions.reduxActions,
		...referenceMapActions.reduxActions,
		...referenceActions.reduxActions,
		...activityMapActions.reduxActions,
		...activityActions.reduxActions,
		...teamProjectMapActions.reduxActions,
		...teamProjectActions.reduxActions
	}, initialState)
);

export const actions = {
	courses: (): FetchableAction => courseMapActions.actions(),

	course: (id: ID): FetchableAction => courseActions.actions(id),

	notices: (courseId: ID): FetchableAction => noticeMapActions.actions(courseId),

	notice: (courseId: ID, id: ID): FetchableAction => noticeActions.actions({ courseId, id }),

	lectures: (courseId: ID): FetchableAction => lectureMapActions.actions(courseId),

	lectureByWeek: (courseId: ID, week: ID): FetchableAction => lectureActions.actions({ courseId, id: week }),

	assignments: (courseId: ID): FetchableAction => assignmentMapActions.actions(courseId),

	assignment: (courseId: ID, id: ID): FetchableAction => assignmentActions.actions({ courseId, id }),

	references: (courseId: ID): FetchableAction => referenceMapActions.actions(courseId),

	reference: (courseId: ID, id: ID): FetchableAction => referenceActions.actions({ courseId, id }),

	activities: (courseId: ID): FetchableAction => activityMapActions.actions(courseId),

	activity: (courseId: ID, id: ID): FetchableAction => activityActions.actions({ courseId, id }),

	teamProjects: (courseId: ID): FetchableAction => teamProjectMapActions.actions(courseId),

	teamProject: (courseId: ID, id: ID): FetchableAction => teamProjectActions.actions({ courseId, id })
};
