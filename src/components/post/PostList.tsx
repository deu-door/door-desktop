import { Box, Link, LinkProps, List, ListItem, styled, Typography } from '@material-ui/core';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { KeepLatestState } from 'components/common/KeepLatestState';
import { useCourses } from 'hooks/door/useCourses';
import { useCoursePosts } from 'hooks/door/usePosts';
import { Due, ICourse, IPostHead, ISubmittablePost, PostVariant } from 'models/door';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { DuePostListItem, PostListItem, SubmittablePostListItem } from './PostListItem';

const FetchLink = styled((props: LinkProps) => <Link component="a" {...props} />)({
	'&:hover': {
		textDecoration: 'none',
	},
	cursor: 'pointer',
});

const isDue = (post: IPostHead): post is IPostHead & Due => {
	return 'duration' in post;
};

const isSubmittable = (post: IPostHead): post is ISubmittablePost => {
	return isDue(post) && 'submitted' in post;
};

const postListItemRenderer = (post: IPostHead) => {
	if (isSubmittable(post)) return <SubmittablePostListItem key={post.id} post={post} />;

	if (isDue(post)) return <DuePostListItem key={post.id} post={post} />;

	return <PostListItem key={post.id} post={post} />;
};

export type PostListProps = RouteComponentProps<{
	courseId: ICourse['id'];
	postVariant: PostVariant;
}>;

export const PostList: React.FC<PostListProps> = props => {
	const {
		match: {
			params: { courseId, postVariant: variant },
		},
	} = props;
	const { courseById } = useCourses();
	const { allPosts, fetchPosts, postsStateByVariant } = useCoursePosts(courseId);

	const course = courseById(courseId);
	const postsState = postsStateByVariant(variant);
	const posts = allPosts().filter(post => post.variant === variant);

	const triggerFetch = () => fetchPosts({ variant, ...course });

	return (
		<Box>
			<KeepLatestState state={postsState} onTriggerFetch={triggerFetch}>
				<FetchLink onClick={triggerFetch}>
					<AsyncThunkState state={postsState} />
				</FetchLink>
			</KeepLatestState>

			<List>
				{posts.length > 0 ? (
					posts
						.sort((postA, postB) => new Date(postB.createdAt).valueOf() - new Date(postA.createdAt).valueOf())
						.map(postListItemRenderer)
				) : (
					<ListItem>
						<Typography color="textSecondary">목록이 비어있습니다</Typography>
					</ListItem>
				)}
			</List>
		</Box>
	);
};
