import { Box, ListItem, ListItemText, ListItemTextProps, styled, Typography } from '@material-ui/core';
import { DateTime } from 'components/common/DateTime';
import { Due, IPostHead, ISubmittablePost } from 'models/door';
import React, { useEffect, useState } from 'react';
import { useHistory, useLocation } from 'react-router';
import { PostSubtitle } from './PostSubtitle';
import { SubmitDuration } from './SubmitDuration';

const BorderedListItem = styled(ListItem)({
	borderTop: '1px solid #E0E0E0',
	paddingTop: 0,
	paddingBottom: 0,

	'&:last-child': {
		borderBottom: '1px solid #E0E0E0',
	},
});

export type PostListItemProps = ListItemTextProps & {
	post: IPostHead;
	trailing?: React.ReactNode;
};

export const PostListItem: React.FC<PostListItemProps> = props => {
	const { post, trailing, ...otherProps } = props;
	const history = useHistory();
	const location = useLocation();

	return (
		<BorderedListItem button onClick={() => history.push(`${location.pathname}/${post.id}`)}>
			<ListItemText
				primary={post.title}
				primaryTypographyProps={{ variant: 'h6' }}
				secondary={<PostSubtitle post={post} />}
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

	return <PostListItem post={post} trailing={<SubmitDuration from={post.duration.from} to={post.duration.to} />} {...otherProps} />;
};

export type SubmittablePostListItemProps = {
	post: ISubmittablePost;
};

export const SubmittablePostListItem: React.FC<SubmittablePostListItemProps> = props => {
	const { post } = props;

	return (
		<DuePostListItem
			post={post}
			secondary={
				<>
					<PostSubtitle post={post}>
						<Box color={post.submitted ? 'success.main' : 'warning.main'} display="inline">
							{post.submitted ? '제출 완료' : '미제출'}
						</Box>
					</PostSubtitle>
				</>
			}
		/>
	);
};
