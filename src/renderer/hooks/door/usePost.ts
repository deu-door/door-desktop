import { actions, selectors } from '../../../common/modules';
import { Course, PostVariant } from 'door-api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function usePost() {
	const state = useSelector(state => state.post);

	const dispatch = useDispatch();

	const postList = selectors.post.selectAll(state);

	const postByURI = (uri: string) => selectors.post.selectById(state, uri);
	const postListByCourse = (courseId: Course['id']) => postList.filter(post => post.courseId === courseId);
	const postListByVariant = (variant: PostVariant) => postList.filter(post => post.variant === variant);
	const postListByCourseAndVariant = (courseId: Course['id'], variant: PostVariant) =>
		postList.filter(post => post.courseId === courseId && post.variant === variant);

	const fetchNoticePostList = useCallback(
		(...params: Parameters<typeof actions.fetchNoticePostList>) => dispatch(actions.fetchNoticePostList(...params)),
		[dispatch],
	);
	const fetchNoticePost = useCallback(
		(...params: Parameters<typeof actions.fetchNoticePost>) => dispatch(actions.fetchNoticePost(...params)),
		[dispatch],
	);
	const fetchReferencePostList = useCallback(
		(...params: Parameters<typeof actions.fetchReferencePostList>) => dispatch(actions.fetchReferencePostList(...params)),
		[dispatch],
	);
	const fetchReferencePost = useCallback(
		(...params: Parameters<typeof actions.fetchReferencePost>) => dispatch(actions.fetchReferencePost(...params)),
		[dispatch],
	);

	return {
		postList,

		postByURI,
		postListByCourse,
		postListByVariant,
		postListByCourseAndVariant,
		fetchNoticePostList,
		fetchNoticePost,
		fetchReferencePostList,
		fetchReferencePost,
	};
}
