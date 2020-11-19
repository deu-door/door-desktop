import { indigo } from '@material-ui/core/colors';
import { Announcement } from '@material-ui/icons';
import React from 'react';
import { Notice } from 'service/door/interfaces/notice';
import { actions } from 'store/modules';
import { PostComponent, PostComponentProps, PostTag } from './PostComponent';

export const NoticeComponent: React.FC<Omit<PostComponentProps, 'post'> & { notice: Notice }> = props => {
	const { notice, ...postProps } = props;

	return (
		<PostComponent
			post={notice}
			action={actions.notice(notice.courseId, notice.id)}
			tag={<PostTag color={indigo[500]} icon={<Announcement />} name="공지" />}
			{...postProps}
		/>
	);
}