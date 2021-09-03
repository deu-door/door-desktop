import { actions, selectors } from '../../../common/modules';
import { Course } from 'door-api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useLecture() {
	const state = useSelector(state => state.lecture);

	const dispatch = useDispatch();

	const lectureList = selectors.lecture.selectAll(state);

	const lectureByUri = (uri: string) => selectors.lecture.selectById(state, uri);
	const lectureListByCourse = (courseId: Course['id']) => lectureList.filter(({ lecture }) => lecture.courseId === courseId);
	const fetchLectureList = useCallback(
		(...params: Parameters<typeof actions.fetchLectureList>) => dispatch(actions.fetchLectureList(...params)),
		[dispatch],
	);
	const fetchLectureProgressList = useCallback(
		(...params: Parameters<typeof actions.fetchLectureProgressList>) => dispatch(actions.fetchLectureProgressList(...params)),
		[dispatch],
	);
	const openLecture = useCallback(
		(...params: Parameters<typeof actions.openLecture>) => dispatch(actions.openLecture(...params)),
		[dispatch],
	);

	return {
		lectureList,

		lectureByUri,
		lectureListByCourse,
		fetchLectureList,
		fetchLectureProgressList,
		openLecture,
	};
}
