import { pink } from '@material-ui/core/colors';
import { Group } from '@material-ui/icons';
import React from 'react';
import { TeamProject } from 'service/door/interfaces/team-project';
import { actions } from 'store/modules';
import { PostTag } from './controls/PostTag';
import { PostComponent, PostComponentProps } from './PostComponent';

export const TeamProjectComponent: React.FC<Omit<PostComponentProps, 'post'> & { teamProject: TeamProject }> = props => {
	const { teamProject, ...postProps } = props;

	return (
		<PostComponent
			post={teamProject}
			action={actions.teamProject(teamProject.courseId, teamProject.id)}
			tag={<PostTag color={pink[500]} icon={<Group />} name="팀플" />}

			submission={teamProject.submission}

			{...postProps}
		/>
	);
}