import { ICourse, ITerm, ResourceID } from 'models/door';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, RootState } from 'store';
import { selectors } from 'store/modules';

const courseTypeCostFunction = (word: string) =>
	// calculate cost (sort priority) of type
	(word.includes('전공') ? 2 : -2) +
	(word.includes('필수') ? 1 : 0) +
	(word.includes('선택') ? -1 : 0) +
	(word.includes('교양') ? 1 : -1) +
	(word.includes('공통') ? -1 : 0);

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useCourses() {
	const courses = useSelector((state: RootState) => state.courses);
	const dispatch = useDispatch();

	const allCourses = () => selectors.coursesSelectors.selectAll(courses);
	const courseById = (id: ICourse['id']) => selectors.coursesSelectors.selectById(courses, id);
	const coursesByTerm = (termId: ITerm['id']) => allCourses().filter(course => course.termId === termId);

	const courseTypes = () =>
		Array.from(allCourses().reduce((accumulator, course) => accumulator.add(course.type), new Set<string>())).sort((a, b) => {
			return courseTypeCostFunction(b) - courseTypeCostFunction(a);
		});

	const fetchCourses = useCallback((...params: Parameters<typeof actions.fetchCourses>[0]) => dispatch(actions.fetchCourses(params)), [
		dispatch,
	]);

	const fetchCourseSyllabus = useCallback(
		(...params: Parameters<typeof actions.fetchCourseSyllabus>[0]) => dispatch(actions.fetchCourseSyllabus(params)),
		[dispatch],
	);

	return {
		allCourses,
		courseById,
		courseTypes,
		coursesByTerm,

		fetchCourses,
		fetchCourseSyllabus,
	};
}
