import { handleActions } from 'redux-actions';
import { FetchableMap, ID } from 'service/door/interfaces';
import { Course, initializeCourse } from 'service/door/interfaces/course';
import { Lecture } from 'service/door/interfaces/lecture';
import { Notice } from 'service/door/interfaces/notice';
import { AsyncState, fetchableActions, fetchableMapActions, FetchableTransform } from './util';
import { getCourseDetail, getCourses } from 'service/door/course';
import { getNotice, getNotices } from 'service/door/notice';
import { getLectures, getLecturesByWeek } from 'service/door/lecture';
import { Assignment } from 'service/door/interfaces/assignment';
import { getAssignment, getAssignments } from 'service/door/assignment';
import { storage } from 'store/storage';
import moment from 'moment';
import { persistReducer } from 'redux-persist';
import { FetchableAction } from '.';
import { Reference } from 'service/door/interfaces/reference';
import { getReference, getReferences } from 'service/door/references';

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
	fetch: getCourses,
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
		validDuration: moment.duration(60, 'minutes')
	}
});

const courseActions = fetchableActions<CourseState, Course, ID>({
	name: 'COURSE',
	selector: state => state.courses,
	path: (draft, id) => draft.items[id],
	fetch: id => getCourseDetail(id),
	options: {
		validDuration: moment.duration(1, 'days')
	}
});

const noticeMapActions = fetchableMapActions<CourseState, Notice, ID>({
	name: 'NOTICE',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].notices,
	fetch: courseId => getNotices(courseId),
	options: {
		validDuration: moment.duration(30, 'minutes')
	}
});

const noticeActions = fetchableActions<CourseState, Notice, { courseId: ID, id: ID }>({
	name: 'NOTICE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].notices.items[id],
	fetch: ({ courseId, id }) => getNotice(courseId, id),
	options: {
		validDuration: moment.duration(60, 'minutes')
	}
});

const lectureMapActions = fetchableMapActions<CourseState, FetchableMap<Lecture>, ID>({
	name: 'LECTURE',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].lectures,
	fetch: courseId => getLectures(courseId),
	options: {
		validDuration: moment.duration(30, 'minutes')
	}
});

const lectureActions = fetchableActions<CourseState, FetchableMap<Lecture>, { courseId: ID, id: ID }>({
	name: 'LECTURE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].lectures.items[id],
	fetch: ({ courseId, id}) => getLecturesByWeek(courseId, id),
	options: {
		validDuration: moment.duration(60, 'minutes')
	}
});

const assignmentMapActions = fetchableMapActions<CourseState, Assignment, ID>({
	name: 'ASSIGNMENT',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].assignments,
	fetch: courseId => getAssignments(courseId),
	options: {
		validDuration: moment.duration(30, 'minutes')
	}
});

const assignmentActions = fetchableActions<CourseState, Assignment, { courseId: ID, id: ID }>({
	name: 'ASSIGNMENT',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].assignments.items[id],
	fetch: ({ courseId, id }) => getAssignment(courseId, id),
	options: {
		validDuration: moment.duration(60, 'minutes')
	}
});

const referenceMapActions = fetchableMapActions<CourseState, Reference, ID>({
	name: 'REFERENCE',
	selector: state => state.courses,
	path: (draft, courseId) => draft.items[courseId].references,
	fetch: courseId => getReferences(courseId),
	options: {
		validDuration: moment.duration(30, 'minutes')
	}
});

const referenceActions = fetchableActions<CourseState, Reference, { courseId: ID, id: ID }>({
	name: 'REFERENCE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].references.items[id],
	fetch: ({ courseId, id }) => getReference(courseId, id),
	options: {
		validDuration: moment.duration(60, 'minutes')
	}
});

export default persistReducer(
	{
		key: 'courses',
		storage: storage,
		transforms: [FetchableTransform]
	},
	handleActions<CourseState, any & never>({
		...courseMapActions.reduxActions,
		...courseActions.reduxActions,
		...noticeMapActions.reduxActions,
		...noticeActions.reduxActions,
		...lectureMapActions.reduxActions,
		...lectureActions.reduxActions,
		...assignmentMapActions.reduxActions,
		...assignmentActions.reduxActions,
		...referenceMapActions.reduxActions,
		...referenceActions.reduxActions
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

	reference: (courseId: ID, id: ID): FetchableAction => referenceActions.actions({ courseId, id })
};
