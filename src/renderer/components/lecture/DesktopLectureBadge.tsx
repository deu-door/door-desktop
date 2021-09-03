import { Box } from '@material-ui/core';
import React from 'react';
import { Lecture } from 'door-api';
import { getLectureStateColor } from '../../../common/helper/lecture';

export type DesktopLectureBadgeProps = {
	type: Lecture['type'] | Lecture['attendance'] | undefined;
};

export const DesktopLectureBadge: React.FC<DesktopLectureBadgeProps> = props => {
	const { type } = props;

	if (type === undefined) return <>-</>;

	return (
		<Box
			borderRadius="0.2rem"
			bgcolor={getLectureStateColor(type)}
			color="white"
			display="inline-block"
			paddingX="0.4rem"
			fontSize="0.8rem"
		>
			{type}
		</Box>
	);
};
