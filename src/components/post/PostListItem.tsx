import { Box, ListItem, ListItemText, ListItemTextProps, styled } from '@material-ui/core';
import { yellow } from '@material-ui/core/colors';
import { Due, IPostHead, ISubmittablePost } from 'models/door';
import { Notable } from 'models/door/notable';
import React from 'react';
import { useHistory } from 'react-router';
import { PostSubtitle, PostSubtitleProps } from './PostSubtitle';
import { SubmitDuration } from './SubmitDuration';

const BorderedListItem = styled(ListItem)({
	borderTop: '1px solid #E0E0E0',
	paddingTop: 0,
	paddingBottom: 0,

	'&:last-child': {
		borderBottom: '1px solid #E0E0E0',
	},
});

const isDue = (post: IPostHead): post is IPostHead & Due => {
	return 'duration' in post;
};

const isSubmittable = (post: IPostHead): post is ISubmittablePost => {
	return isDue(post) && 'submitted' in post;
};

const isNotable = (post: IPostHead): post is IPostHead & Notable => {
	return 'noted' in post;
};

export type PostListItemRendererProps = PostListItemProps;

export const PostListItemRenderer: React.FC<PostListItemRendererProps> = props => {
	const { post, ...otherProps } = props;

	if (isSubmittable(post)) return <SubmittablePostListItem post={post} {...otherProps} />;

	if (isDue(post)) return <DuePostListItem post={post} {...otherProps} />;

	return <PostListItem post={post} {...otherProps} />;
};

export type PostListItemProps = ListItemTextProps & {
	post: IPostHead;
	PostSubtitleProps?: Partial<PostSubtitleProps>;
	trailing?: React.ReactNode;
};

export const PostListItem: React.FC<PostListItemProps> = props => {
	const { post, PostSubtitleProps, trailing, ...otherProps } = props;
	const history = useHistory();

	return (
		<BorderedListItem
			button
			onClick={() => history.push(`/courses/${post.courseId}/${post.variant}/${post.id}`)}
			style={{ backgroundColor: isNotable(post) && !post.noted ? yellow[100] : undefined }}
		>
			<ListItemText
				primary={post.title}
				primaryTypographyProps={{ variant: 'subtitle1' }}
				secondary={<PostSubtitle post={post} {...(PostSubtitleProps ?? {})} />}
				{...otherProps}
			/>
			{trailing}
		</BorderedListItem>
	);
};

export type DuePostListItemProps = PostListItemProps & {
	post: IPostHead & Due;
};

export const DuePostListItem: React.FC<DuePostListItemProps> = props => {
	const { post, ...otherProps } = props;

	return (
		<PostListItem
			post={post}
			trailing={<SubmitDuration duration={post.duration} additionalDuration={post.additionalDuration} />}
			{...otherProps}
		/>
	);
};

export type SubmittablePostListItemProps = PostListItemProps & {
	post: ISubmittablePost;
};

export const SubmittablePostListItem: React.FC<SubmittablePostListItemProps> = props => {
	const { post, PostSubtitleProps, trailing, ...otherProps } = props;

	return (
		<DuePostListItem
			post={post}
			secondary={
				<>
					{trailing ?? (
						<PostSubtitle post={post} {...(PostSubtitleProps ?? {})}>
							<Box color={post.submitted ? 'success.main' : 'warning.main'} display="inline">
								{post.submitted ? '제출 완료' : '미제출'}
							</Box>
						</PostSubtitle>
					)}
				</>
			}
			{...otherProps}
		/>
	);
};
