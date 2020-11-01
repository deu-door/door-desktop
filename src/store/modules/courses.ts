import { handleActions } from 'redux-actions';
import { FetchableMap, ID } from 'service/door/interfaces';
import { Course } from 'service/door/interfaces/course';
import { Lecture } from 'service/door/interfaces/lecture';
import { Notice } from 'service/door/interfaces/notice';
import { AsyncState, fetchableActions, fetchableMapActions } from './util';
import { getCourseDetail, getCourses } from 'service/door/course';
import { getNotice, getNotices } from 'service/door/notice';
import { getLectures, getLecturesByWeek } from 'service/door/lecture';
import { Assignment } from 'service/door/interfaces/assignment';
import { getAssignment, getAssignments } from 'service/door/assignment';
import { FetchableAction } from '.';
import moment from 'moment';

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
	}
});

const returnOrSetDefault = <T, R>(path: T, defaul: R): typeof path => {
	if(path) return path;
	Object.assign(path, defaul);
	return path;
}

const courseActions = fetchableActions<CourseState, Course, ID>({
	name: 'COURSE',
	selector: state => state.courses,
	path: (draft, id) => draft.items[id],
	fetch: id => getCourseDetail(id)
});

const noticeMapActions = fetchableMapActions<CourseState, Notice, ID>({
	name: 'NOTICE',
	selector: state => state.courses,
	path: (draft, courseId) => returnOrSetDefault(draft.items[courseId].notices, { items: {}, fulfilled: false }),
	fetch: courseId => getNotices(courseId)
});

const noticeActions = fetchableActions<CourseState, Notice, { courseId: ID, id: ID }>({
	name: 'NOTICE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].notices.items[id],
	fetch: ({ id }) => getNotice(id)
});

const lectureMapActions = fetchableMapActions<CourseState, FetchableMap<Lecture>, ID>({
	name: 'LECTURE',
	selector: state => state.courses,
	path: (draft, courseId) => returnOrSetDefault(draft.items[courseId].lectures, { items: {}, fulfilled: false }),
	fetch: courseId => getLectures(courseId)
});

const lectureActions = fetchableActions<CourseState, FetchableMap<Lecture>, { courseId: ID, id: ID }>({
	name: 'LECTURE',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].lectures.items[id],
	fetch: ({ courseId, id}) => getLecturesByWeek(courseId, id)
});

const assignmentMapActions = fetchableMapActions<CourseState, Assignment, ID>({
	name: 'ASSIGNMENT',
	selector: state => state.courses,
	path: (draft, courseId) => returnOrSetDefault(draft.items[courseId].assignments, { items: {}, fulfilled: false }),
	fetch: courseId => getAssignments(courseId)
});

const assignmentActions = fetchableActions<CourseState, Assignment, { courseId: ID, id: ID }>({
	name: 'ASSIGNMENT',
	selector: state => state.courses,
	path: (draft, { courseId, id }) => draft.items[courseId].assignments.items[id],
	fetch: ({ courseId, id }) => getAssignment(courseId, id)
});

export default handleActions<CourseState, any & never>({
	...courseMapActions.actions,
	...courseActions.actions,
	...noticeMapActions.actions,
	...noticeActions.actions,
	...lectureMapActions.actions,
	...lectureActions.actions,
	...assignmentMapActions.actions,
	...assignmentActions.actions
}, initialState);

export const actions = {
	courses: (): FetchableAction => ({
		fetch: () => courseMapActions.fetch(),
		fetchIfExpired: () => courseMapActions.fetchIfExpired(undefined, moment.duration(60, 'minutes')),
		timeout: () => courseMapActions.timeout()
	}),

	course: (id: ID): FetchableAction => ({
		fetch: () => courseActions.fetch(id),
		fetchIfExpired: () => courseActions.fetchIfExpired(id, moment.duration(1, 'days')),
		timeout: () => courseActions.timeout(id)
	}),

	notices: (courseId: ID): FetchableAction => ({
		fetch: () => noticeMapActions.fetch(courseId),
		fetchIfExpired: () => noticeMapActions.fetchIfExpired(courseId, moment.duration(30, 'minutes')),
		timeout: () => noticeMapActions.timeout(courseId),
	}),

	notice: (courseId: ID, id: ID): FetchableAction => ({
		fetch: () => noticeActions.fetch({ courseId, id }),
		fetchIfExpired: () => noticeActions.fetchIfExpired({ courseId, id }, moment.duration(1, 'hours')),
		timeout: () => noticeActions.timeout({ courseId, id })
	}),

	lectures: (courseId: ID): FetchableAction => ({
		fetch: () => lectureMapActions.fetch(courseId),
		fetchIfExpired: () => lectureMapActions.fetchIfExpired(courseId, moment.duration(30, 'minutes')),
		timeout: () => lectureMapActions.timeout(courseId)
	}),

	lectureByWeek: (courseId: ID, week: ID): FetchableAction => ({
		fetch: () => lectureActions.fetch({ courseId, id: week }),
		fetchIfExpired: () => lectureActions.fetchIfExpired({ courseId, id: week }, moment.duration(1, 'hours')),
		timeout: () => lectureActions.timeout({ courseId, id: week })
	}),

	assignments: (courseId: ID): FetchableAction => ({
		fetch: () => assignmentMapActions.fetch(courseId),
		fetchIfExpired: () => assignmentMapActions.fetchIfExpired(courseId, moment.duration(30, 'minutes')),
		timeout: () => assignmentMapActions.timeout(courseId)
	}),

	assignment: (courseId: ID, id: ID): FetchableAction => ({
		fetch: () => assignmentActions.fetch({ courseId, id }),
		fetchIfExpired: () => assignmentActions.fetchIfExpired({ courseId, id }, moment.duration(1, 'hours')),
		timeout: () => assignmentActions.fetch({ courseId, id })
	})
};
