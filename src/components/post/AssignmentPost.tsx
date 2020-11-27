import { teal } from '@material-ui/core/colors';
import { AssignmentLate } from '@material-ui/icons';
import React from 'react';
import { Assignment } from 'service/door/interfaces/assignment';
import { actions } from 'store/modules';
import { PostTag } from './controls/PostTag';
import { SubmittablePostBase, SubmittablePostBaseProps } from './PostBase';

export type AssignmentPostProps = {
	post: Assignment
} & SubmittablePostBaseProps

export const AssignmentPost: React.FC<AssignmentPostProps> = props => {
	const { post: assignment, ...postProps } = props;

	return (
		<SubmittablePostBase
			post={assignment}
			action={actions.assignment(assignment.courseId, assignment.id)}
			tag={<PostTag color={teal[500]} icon={<AssignmentLate />} name="과제" />}

			{...postProps}
		/>
	);
}