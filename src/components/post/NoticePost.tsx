import { indigo } from '@material-ui/core/colors';
import { Announcement } from '@material-ui/icons';
import React from 'react';
import { Notice } from 'service/door/interfaces/notice';
import { actions } from 'store/modules';
import { PostTag } from './controls/PostTag';
import { PostBase, PostBaseProps } from './PostBase';

export interface NoticePostProps extends PostBaseProps {
	post: Notice
}

export const NoticePost: React.FC<NoticePostProps> = props => {
	const { post: notice, ...postProps } = props;

	return (
		<PostBase
			post={notice}
			action={actions.notice(notice.courseId, notice.id)}
			tag={<PostTag color={indigo[500]} icon={<Announcement />} name="공지" />}
			
			{...postProps}
		/>
	);
}