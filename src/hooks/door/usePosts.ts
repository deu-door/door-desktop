import { ICourse, IPost, PostVariant, ResourceID } from 'models/door';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, RootState } from 'store';
import { selectors } from 'store/modules';
import { postUniqueId } from 'store/modules/posts';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function usePosts() {
	const { posts, byCourse } = useSelector((state: RootState) => state.posts);
	const dispatch = useDispatch();

	const postsStateByVariantByCourseId = (courseId: ICourse['id']) => (variant: PostVariant) =>
		selectors.byCourseSelectors.selectById(byCourse, courseId)?.[variant];

	const allPosts = () => selectors.postsSelectors.selectAll(posts);
	const postById = (variant: PostVariant, id: IPost['id']) => selectors.postsSelectors.selectById(posts, postUniqueId({ id, variant }));

	const fetchPosts = useCallback((...params: Parameters<typeof actions.fetchPosts>) => dispatch(actions.fetchPosts(...params)), [
		dispatch,
	]);

	const fetchPost = useCallback((...params: Parameters<typeof actions.fetchPost>) => dispatch(actions.fetchPost(...params)), [dispatch]);

	const putSubmission = useCallback((...params: Parameters<typeof actions.putSubmission>) => dispatch(actions.putSubmission(...params)), [
		dispatch,
	]);

	return {
		allPosts,
		postById,

		postsStateByVariantByCourseId,

		fetchPosts,
		fetchPost,

		putSubmission,
	};
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useCoursePosts(courseId: ICourse['id']) {
	const { allPosts: _allPosts, postsStateByVariantByCourseId, postById, fetchPost } = usePosts();
	const dispatch = useDispatch();

	const allPosts = () => _allPosts().filter(post => post.courseId === courseId);
	const postsStateByVariant = postsStateByVariantByCourseId(courseId);

	const fetchPosts = useCallback(
		(params: Omit<Parameters<typeof actions.fetchPosts>[0], 'id'>) => dispatch(actions.fetchPosts({ id: courseId, ...params })),
		[dispatch],
	);

	const putSubmission = useCallback(
		(params: Omit<Parameters<typeof actions.putSubmission>[0], 'courseId'>) => dispatch(actions.putSubmission({ courseId, ...params })),
		[dispatch],
	);

	return {
		allPosts,
		postById,
		postsStateByVariant,
		fetchPosts,
		fetchPost,
		putSubmission,
	};
}
