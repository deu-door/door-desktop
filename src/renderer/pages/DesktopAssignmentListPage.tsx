import { assignmentListURI } from '../../common/uri/uri';
import { AssignmentVariant, AssignmentVariantNames, Course } from 'door-api';
import { RouteComponentProps } from 'react-router';
import { DesktopRequestButton } from '../components/common/DesktopRequestButton';
import { DesktopSpacer } from '../components/common/DesktopSpacer';
import React from 'react';
import { DesktopRequestTrigger } from '../components/common/DesktopRequestTrigger';
import { useAssignment } from '../hooks/door/useAssignment';
import { DesktopContentList } from '../components/content/DesktopContentList';

export type DesktopAssignmentListPageProps = RouteComponentProps<{
	courseId: Course['id'];
	variant: AssignmentVariant;
}>;

export const DesktopAssignmentListPage: React.FC<DesktopAssignmentListPageProps> = props => {
	const {
		match: {
			params: { courseId, variant },
		},
	} = props;

	const { assignmentListByCourseAndVariant, fetchHomeworkList, fetchTeamProjectList, fetchActivityList } = useAssignment();
	const assignmentList = assignmentListByCourseAndVariant(courseId, variant);

	const fetch = () => {
		switch (variant) {
			case AssignmentVariant.HOMEWORK:
				return fetchHomeworkList(courseId);
			case AssignmentVariant.TEAM_PROJECT:
				return fetchTeamProjectList(courseId);
			case AssignmentVariant.ACTIVITY:
				return fetchActivityList(courseId);
		}
	};

	return (
		<>
			<DesktopRequestTrigger uri={assignmentListURI({ id: courseId, variant })} onRequest={fetch} />
			<DesktopRequestButton uri={assignmentListURI({ id: courseId, variant })} onClick={fetch} />
			<DesktopSpacer vertical={0.7} />
			<DesktopContentList title={AssignmentVariantNames[variant]} list={assignmentList} />
		</>
	);
};
