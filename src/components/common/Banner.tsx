import { Box, BoxProps, Paper, Typography } from '@material-ui/core';
import React from 'react';

export type BannerProps = BoxProps;

export const Banner: React.FC<BannerProps> = props => {
	const { ...otherProps } = props;

	return (
		<Paper elevation={0}>
			<Box height="72px" {...otherProps} display="flex" alignItems="center" paddingLeft="1.5rem">
				<Typography variant="subtitle1" color="textSecondary">
					Door Desktop 베타 테스트 버전입니다!
				</Typography>
			</Box>
		</Paper>
	);
};
