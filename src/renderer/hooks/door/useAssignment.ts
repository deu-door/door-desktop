import { actions, selectors } from '../../../common/modules';
import { AssignmentVariant, Course } from 'door-api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useAssignment() {
	const state = useSelector(state => state.assignment);

	const dispatch = useDispatch();

	const assignmentList = selectors.assignment.selectAll(state);

	const assignmentByURI = (uri: string) => selectors.assignment.selectById(state, uri);
	const assignmentListByCourse = (courseId: Course['id']) => assignmentList.filter(assignment => assignment.courseId === courseId);
	const assignmentListByVariant = (variant: AssignmentVariant) => assignmentList.filter(assignment => assignment.variant === variant);
	const assignmentListByCourseAndVariant = (courseId: Course['id'], variant: AssignmentVariant) =>
		assignmentList.filter(assignment => assignment.courseId === courseId && assignment.variant === variant);

	const fetchHomeworkList = useCallback(
		(...params: Parameters<typeof actions.fetchHomeworkList>) => dispatch(actions.fetchHomeworkList(...params)),
		[dispatch],
	);
	const fetchHomework = useCallback(
		(...params: Parameters<typeof actions.fetchHomework>) => dispatch(actions.fetchHomework(...params)),
		[dispatch],
	);

	const fetchTeamProjectList = useCallback(
		(...params: Parameters<typeof actions.fetchTeamProjectList>) => dispatch(actions.fetchTeamProjectList(...params)),
		[dispatch],
	);
	const fetchTeamProject = useCallback(
		(...params: Parameters<typeof actions.fetchTeamProject>) => dispatch(actions.fetchTeamProject(...params)),
		[dispatch],
	);

	const fetchActivityList = useCallback(
		(...params: Parameters<typeof actions.fetchActivityList>) => dispatch(actions.fetchActivityList(...params)),
		[dispatch],
	);
	const fetchActivity = useCallback(
		(...params: Parameters<typeof actions.fetchActivity>) => dispatch(actions.fetchActivity(...params)),
		[dispatch],
	);

	return {
		assignmentList,

		assignmentByURI,
		assignmentListByCourse,
		assignmentListByVariant,
		assignmentListByCourseAndVariant,
		fetchHomeworkList,
		fetchHomework,
		fetchTeamProjectList,
		fetchTeamProject,
		fetchActivityList,
		fetchActivity,
	};
}
