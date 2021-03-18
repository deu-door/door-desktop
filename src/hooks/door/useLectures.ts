import { ICourse } from 'models/door';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { actions, selectors } from 'store/modules';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useLectures() {
	const lectures = useSelector((state: RootState) => state.lectures);
	const dispatch = useDispatch();

	const allLectures = () =>
		selectors.lecturesSelectors
			.selectAll(lectures)
			.map(lecturesByCourse => lecturesByCourse.lectures)
			.flat();

	const allLecturesByCourseId = (courseId: ICourse['id']) => selectors.lecturesSelectors.selectById(lectures, courseId);

	const fetchLectures = useCallback((...params: Parameters<typeof actions.fetchLectures>) => dispatch(actions.fetchLectures(...params)), [
		dispatch,
	]);

	const fetchLectureProgresses = useCallback(
		(...params: Parameters<typeof actions.fetchLectureProgresses>) => dispatch(actions.fetchLectureProgresses(...params)),
		[dispatch],
	);

	return {
		allLectures,
		allLecturesByCourseId,

		fetchLectures,
		fetchLectureProgresses,
	};
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useCourseLectures(courseId: ICourse['id']) {
	const { allLecturesByCourseId, fetchLectures: _fetchLectures, fetchLectureProgresses: _fetchLectureProgresses } = useLectures();

	const lecturesState = allLecturesByCourseId(courseId);

	const allLectures = () => lecturesState?.lectures ?? [];

	const weeks = () => Array.from(allLectures().reduce((accumulator, lecture) => accumulator.add(lecture.week), new Set<number>()) || []);

	const lecturesByWeek = (week: number) => allLectures().filter(lecture => lecture.week === week);

	const fetchLectures = () => _fetchLectures({ id: courseId });

	const fetchLectureProgresses = () => _fetchLectureProgresses({ id: courseId });

	return {
		lecturesState,

		allLectures,
		lecturesByWeek,
		weeks,

		fetchLectures,
		fetchLectureProgresses,
	};
}
