import { Box, BoxProps, Paper, Typography } from '@material-ui/core';
import { ErrorOutline } from '@material-ui/icons';
import React from 'react';
import { PACKAGE_AUTHOR, PACKAGE_PRODUCT_NAME, PACKAGE_VERSION } from '../../../common/constants';
import { DesktopSpacer } from './DesktopSpacer';

export type DesktopBannerProps = BoxProps;

export const DesktopBanner: React.FC<DesktopBannerProps> = props => {
	const { ...BoxProps } = props;

	return (
		<Paper elevation={0}>
			<Typography variant="subtitle1" color="textSecondary">
				<Box height="72px" {...BoxProps} display="flex" alignItems="center" paddingLeft="1.5rem">
					<ErrorOutline color="inherit" />
					<DesktopSpacer horizontal={0.5} />
					{PACKAGE_PRODUCT_NAME} v{PACKAGE_VERSION} by {PACKAGE_AUTHOR}
				</Box>
			</Typography>
		</Paper>
	);
};
