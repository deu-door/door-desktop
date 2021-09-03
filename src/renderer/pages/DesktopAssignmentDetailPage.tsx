import { Divider } from '@material-ui/core';
import { Assignment, AssignmentVariant } from 'door-api';
import React from 'react';
import { RouteComponentProps } from 'react-router';
import { assignmentURI } from '../../common/uri/uri';
import { DesktopSubmission } from '../components/submission/DesktopSubmission';
import { DesktopSubmissionState } from '../components/submission/DesktopSubmissionState';
import { DesktopAttachmentList } from '../components/common/DesktopAttachment';
import { DesktopHtml } from '../components/common/DesktopHtml';
import { DesktopPreviousButton } from '../components/common/DesktopPreviousButton';
import { DesktopRequestButton } from '../components/common/DesktopRequestButton';
import { DesktopRequestTrigger } from '../components/common/DesktopRequestTrigger';
import { DesktopSpacer } from '../components/common/DesktopSpacer';
import { DesktopContentSubtitle } from '../components/content/DesktopContentSubtitle';
import { DesktopContentTitle } from '../components/content/DesktopContentTitle';
import { useAssignment } from '../hooks/door/useAssignment';
import { DesktopNotFoundPage } from './DesktopNotFoundPage';

export type DesktopAssignmentDetailPageProps = RouteComponentProps<{
	variant: AssignmentVariant;
	assignmentId: Assignment['id'];
}>;

export const DesktopAssignmentDetailPage: React.FC<DesktopAssignmentDetailPageProps> = props => {
	const {
		match: {
			params: { assignmentId: id, variant },
		},
	} = props;

	const { assignmentByURI, fetchHomework, fetchTeamProject, fetchActivity } = useAssignment();
	const assignment = assignmentByURI(assignmentURI({ id, variant }));

	if (assignment === undefined)
		return <DesktopNotFoundPage>{`${assignmentURI({ id, variant })} 에 해당되는 게시물이 없습니다.`}</DesktopNotFoundPage>;

	const fetch = () => {
		switch (assignment.variant) {
			case AssignmentVariant.HOMEWORK:
				return fetchHomework(assignment);
			case AssignmentVariant.TEAM_PROJECT:
				return fetchTeamProject(assignment);
			case AssignmentVariant.ACTIVITY:
				return fetchActivity(assignment);
		}
	};

	return (
		<>
			<DesktopRequestTrigger uri={assignmentURI(assignment)} onRequest={fetch} />

			<DesktopPreviousButton />

			<DesktopSpacer vertical={3} />
			<DesktopContentTitle content={assignment} />
			<DesktopSpacer vertical={0.5} />
			<DesktopContentSubtitle content={assignment} course />

			<DesktopSpacer vertical={1} />
			<DesktopRequestButton uri={assignmentURI(assignment)} onClick={fetch} />
			<DesktopSpacer vertical={1} />
			<Divider />
			<DesktopSpacer vertical={1} />

			{assignment.partial === false && (
				<>
					<DesktopSpacer vertical={2} />
					<DesktopSubmissionState assignment={assignment} />
					<DesktopSpacer vertical={3} />
					<DesktopAttachmentList attachments={assignment.attachments} />
					<DesktopSpacer vertical={1} />
					<DesktopHtml content={assignment.contents} />
					<DesktopSpacer vertical={18} />
					<DesktopSubmission assignment={assignment} />
				</>
			)}
		</>
	);
};
