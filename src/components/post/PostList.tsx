import { Box, Link, LinkProps, List, ListItem, ListItemText, styled, Typography } from '@material-ui/core';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { KeepLatestState } from 'components/common/KeepLatestState';
import { useCourses } from 'hooks/door/useCourses';
import { useCoursePosts } from 'hooks/door/usePosts';
import { Due, ICourse, IPostHead, ISubmittablePost, PostVariant } from 'models/door';
import React, { useState } from 'react';
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

export type PostListProps = {
	posts: IPostHead[];
	empty?: React.ReactNode;
	itemRenderer?: (post: IPostHead) => React.ReactNode;
	threshold?: number;
};

export const PostList: React.FC<PostListProps> = props => {
	const { posts, empty, itemRenderer = postListItemRenderer, threshold = 50 } = props;
	const [expanded, setExpanded] = useState(1);

	return (
		<List disablePadding>
			{posts.length > 0 ? (
				<>
					{posts
						.sort((postA, postB) => new Date(postB.createdAt).valueOf() - new Date(postA.createdAt).valueOf())
						.slice(0, threshold * expanded)
						.map(itemRenderer)}
					{threshold * expanded < posts.length && (
						<ListItem button onClick={() => setExpanded(expanded + 1)} style={{ display: 'flex', justifyContent: 'center' }}>
							<Typography variant="subtitle2" color="textSecondary">
								더보기
							</Typography>
						</ListItem>
					)}
				</>
			) : (
				<ListItem>{empty ?? <Typography color="textSecondary">목록이 비어있습니다</Typography>}</ListItem>
			)}
		</List>
	);
};

export type RoutePostListProps = RouteComponentProps<{ courseId: ICourse['id']; postVariant: PostVariant }>;

export const RoutePostList: React.FC<RoutePostListProps> = props => {
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

			<PostList posts={posts} />
		</Box>
	);
};
