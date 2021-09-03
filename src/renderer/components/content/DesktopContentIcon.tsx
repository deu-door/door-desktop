import { Tooltip } from '@material-ui/core';
import { Accessibility, Description, Group, Notifications, Person } from '@material-ui/icons';
import { AssignmentVariant, AssignmentVariantNames, PostVariant, PostVariantNames } from 'door-api';
import React from 'react';

const variantNames = {
	...PostVariantNames,
	...AssignmentVariantNames,
};

export type DesktopContentIconProps = {
	fontSize?: string | number;
	variant: PostVariant | AssignmentVariant;
};

export const DesktopContentIcon: React.FC<DesktopContentIconProps> = props => {
	const { variant, fontSize = 'inherit' } = props;

	return (
		<Tooltip title={variantNames[variant]} placement="top">
			{variant === PostVariant.NOTICE ? (
				<Notifications style={{ fontSize }} fontSize="inherit" color="inherit" />
			) : variant === PostVariant.REFERENCE ? (
				<Description style={{ fontSize }} fontSize="inherit" color="inherit" />
			) : variant === AssignmentVariant.HOMEWORK ? (
				<Person style={{ fontSize }} fontSize="inherit" color="inherit" />
			) : variant === AssignmentVariant.TEAM_PROJECT ? (
				<Group style={{ fontSize }} fontSize="inherit" color="inherit" />
			) : AssignmentVariant.ACTIVITY ? (
				<Accessibility style={{ fontSize }} fontSize="inherit" color="inherit" />
			) : (
				<></>
			)}
		</Tooltip>
	);
};
