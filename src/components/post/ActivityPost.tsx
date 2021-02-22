import { cyan } from '@material-ui/core/colors';
import { Assignment } from '@material-ui/icons';
import React from 'react';
import { Activity } from 'service/door/interfaces/activity';
import { actions } from 'store/modules';
import { PostTag } from './controls/PostTag';
import { SubmittablePostBase, SubmittablePostBaseProps } from './PostBase';

export type ActivityPostProps = {
	post: Activity;
} & SubmittablePostBaseProps;

export const ActivityPost: React.FC<ActivityPostProps> = props => {
	const { post: activity, ...postProps } = props;

	return (
		<SubmittablePostBase
			post={activity}
			action={actions.activity(activity.courseId, activity.id)}
			tag={
				<PostTag color={cyan[500]} icon={<Assignment />} name="일지" />
			}
			{...postProps}
		/>
	);
};
