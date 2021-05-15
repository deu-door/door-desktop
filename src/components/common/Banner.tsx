import { Box, BoxProps, Paper, Typography } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import { version } from '../../../package.json';
import React from 'react';

export type BannerProps = BoxProps;

export const Banner: React.FC<BannerProps> = props => {
	const { ...otherProps } = props;
	console.log(process.env);

	return (
		<Paper elevation={0}>
			<Typography variant="subtitle1" color="textSecondary">
				<Box height="72px" {...otherProps} display="flex" alignItems="center" paddingLeft="1.5rem">
					<ErrorOutline color="inherit" />
					<Box width="0.5rem" />
					Door Desktop v{version} - 비공개 테스트 버전입니다.
				</Box>
			</Typography>
		</Paper>
	);
};
