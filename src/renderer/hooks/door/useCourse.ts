import { actions, selectors } from '../../../common/modules';
import { Course, Term } from 'door-api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';

const getCourseTypeWeight = (word: string) =>
	// calculate cost (sort priority) of type
	(word.includes('전공') ? 2 : -2) +
	(word.includes('필수') ? 1 : 0) +
	(word.includes('선택') ? -1 : 0) +
	(word.includes('교양') ? 1 : -1) +
	(word.includes('공통') ? -1 : 0);

const sortByCourseType = (a: string, b: string): number => getCourseTypeWeight(b) - getCourseTypeWeight(a);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useCourse() {
	const state = useSelector(state => state.course);
	const dispatch = useDispatch();

	const courseList = selectors.course.selectAll(state);

	const courseById = (id: Course['id']) => selectors.course.selectById(state, id);
	const courseListByTerm = (termId: Term['id']) => courseList.filter(course => course.termId === termId);
	const courseTypeList = () => [...new Set(courseList.map(course => course.type))].sort(sortByCourseType);

	const fetchCourseList = useCallback(
		(...params: Parameters<typeof actions.fetchCourseList>) => dispatch(actions.fetchCourseList(...params)),
		[dispatch],
	);
	const fetchCourseSyllabus = useCallback(
		(...params: Parameters<typeof actions.fetchCourseSyllabus>) => dispatch(actions.fetchCourseSyllabus(...params)),
		[dispatch],
	);

	return {
		courseList,

		courseById,
		courseListByTerm,
		courseTypeList,

		fetchCourseList,
		fetchCourseSyllabus,
	};
}
