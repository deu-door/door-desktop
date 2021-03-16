import { Box, Typography } from '@material-ui/core';
import React from 'react';

export const Footer: React.FC = props => {
	return (
		<Box display="flex" minHeight="96px" alignItems="center">
			<Typography variant="caption" color="textSecondary">
				Authored by solo5star. project link: https://github.com/deu-door/door-desktop
			</Typography>
		</Box>
	);
};
