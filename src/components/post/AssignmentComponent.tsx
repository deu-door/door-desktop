import { CardContent, Divider } from '@material-ui/core';
import { teal } from '@material-ui/core/colors';
import { AssignmentLate } from '@material-ui/icons';
import React from 'react';
import { Assignment } from 'service/door/interfaces/assignment';
import { actions } from 'store/modules';
import { PostAttachment, PostComponent, PostComponentProps, PostContent, PostEvaluationResult, PostSubmission, PostTag } from './PostComponent';

export const AssignmentComponent: React.FC<Omit<PostComponentProps, 'post'> & { assignment: Assignment }> = props => {
	const { assignment, ...postProps } = props;

	return (
		<PostComponent
			post={assignment}
			action={actions.assignment(assignment.courseId, assignment.id)}
			tag={<PostTag color={teal[500]} icon={<AssignmentLate />} name="과제" />}
			{...postProps}
		>
			<CardContent>
				{assignment.contents && <PostContent content={assignment.contents} />}

				{assignment.attachments && assignment.attachments.map(attachment => <PostAttachment key={attachment.link} attachment={attachment} />)}

				<Divider />
				
				<PostSubmission submission={assignment.submission} />

				{assignment.result && <PostEvaluationResult result={assignment.result} />}
			</CardContent>
		</PostComponent>
	);
}