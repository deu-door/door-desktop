import { cyan } from '@material-ui/core/colors';
import { Assignment } from '@material-ui/icons';
import React from 'react';
import { Activity } from 'service/door/interfaces/activity';
import { actions } from 'store/modules';
import { PostTag } from './controls/PostTag';
import { PostComponent, PostComponentProps } from './PostComponent';

export const ActivityComponent: React.FC<Omit<PostComponentProps, 'post'> & { activity: Activity }> = props => {
	const { activity, ...postProps } = props;

	return (
		<PostComponent
			post={activity}
			action={actions.activity(activity.courseId, activity.id)}
			tag={<PostTag color={cyan[500]} icon={<Assignment />} name="일지" />}

			submission={activity.submission}
			evaluationResult={activity.result}

			{...postProps}
		/>
	);
}