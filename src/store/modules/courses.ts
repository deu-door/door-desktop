import { handleActions } from 'redux-actions';
import { FetchableMap, ID } from 'service/door/interfaces';
import { Course } from 'service/door/interfaces/course';
import { Lecture } from 'service/door/interfaces/lecture';
import { Notice } from 'service/door/interfaces/notice';
import { AsyncState, fetchableActions, fetchableMapActions } from '.';
import { getCourseDetail, getCourses } from 'service/door/course';
import { getNotice, getNotices } from 'service/door/notice';
import { getLectures, getLecturesByWeek } from 'service/door/lecture';
import { Assignment } from 'service/door/interfaces/assignment';
import { getAssignment, getAssignments } from 'service/door/assignment';

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

const courseMapActions = fetchableMapActions<CourseState, Course, void>(
	'COURSE',
	(draft) => draft,
	getCourses,
	{
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
);

const courseActions = fetchableActions<CourseState, Course, ID>(
	'COURSE',
	(draft, id) => draft.items[id],
	id => getCourseDetail(id)
);

const noticeMapActions = fetchableMapActions<CourseState, Notice, ID>(
	'NOTICE',
	(draft, courseId) => draft.items[courseId].notices = draft.items[courseId].notices || { items: {}, fulfilled: false },
	courseId => getNotices(courseId)
);

const noticeActions = fetchableActions<CourseState, Notice, { courseId: ID, id: ID }>(
	'NOTICE',
	(draft, { courseId, id }) => draft.items[courseId].notices.items[id],
	({ id }) => getNotice(id)
);

const lectureMapActions = fetchableMapActions<CourseState, FetchableMap<Lecture>, ID>(
	'LECTURE',
	(draft, courseId) => draft.items[courseId].lectures = draft.items[courseId].lectures || { items: {}, fulfilled: false },
	courseId => getLectures(courseId)
);

const lectureActions = fetchableActions<CourseState, FetchableMap<Lecture>, { courseId: ID, id: ID }>(
	'LECTURE',
	(draft, { courseId, id }) => draft.items[courseId].lectures.items[id],
	({ courseId, id}) => getLecturesByWeek(courseId, id)
);

const assignmentMapActions = fetchableMapActions<CourseState, Assignment, ID>(
	'ASSIGNMENT',
	(draft, courseId) => draft.items[courseId].assignments = draft.items[courseId].assignments || { items: {}, fulfilled: false },
	courseId => getAssignments(courseId)
);

const assignmentActions = fetchableActions<CourseState, Assignment, { courseId: ID, id: ID }>(
	'ASSIGNMENT',
	(draft, { courseId, id }) => draft.items[courseId].assignments.items[id],
	({ courseId, id }) => getAssignment(courseId, id)
);

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

export const fetchCourses = () => courseMapActions.fetch();

export const fetchCourse = (id: ID) => courseActions.fetch(id);

export const fetchNotices = (courseId: ID) => noticeMapActions.fetch(courseId);

export const fetchNotice = (courseId: ID, id: ID) => noticeActions.fetch({ courseId, id });

export const fetchLectures = (courseId: ID) => lectureMapActions.fetch(courseId);

export const fetchLectureByWeek = (courseId: ID, week: ID) => lectureActions.fetch({ courseId, id: week });

export const fetchAssignments = (courseId: ID) => assignmentMapActions.fetch(courseId);

export const fetchAssignment = (courseId: ID, id: ID) => assignmentActions.fetch({ courseId, id });
