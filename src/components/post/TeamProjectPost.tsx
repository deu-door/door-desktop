import { pink } from '@material-ui/core/colors';
import { Group } from '@material-ui/icons';
import React from 'react';
import { TeamProject } from 'services/door/interfaces/team-project';
import { actions } from 'store/modules';
import { PostTag } from './controls/PostTag';
import { SubmittablePostBase, SubmittablePostBaseProps } from './PostBase';

export type TeamProjectPostProps = {
	post: TeamProject;
} & SubmittablePostBaseProps;

export const TeamProjectPost: React.FC<TeamProjectPostProps> = props => {
	const { post: teamProject, ...postProps } = props;

	return (
		<SubmittablePostBase
			post={teamProject}
			action={actions.teamProject(teamProject.courseId, teamProject.id)}
			tag={<PostTag color={pink[500]} icon={<Group />} name="팀플" />}
			{...postProps}
		/>
	);
};
