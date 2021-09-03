import { Box, CircularProgress, Typography } from '@material-ui/core';
import React from 'react';
import { default as LogoOriginalWhite } from '../../static/logo-original-white.svg';
import { DesktopSpacer } from '../components/common/DesktopSpacer';

/**
 * renders splash page and try to login with saved credential. if failed, redirect to login page
 */
export const DesktopLoadingPage: React.FC = props => {
	const { children } = props;

	return (
		<Box
			flex={1}
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			bgcolor="primary.main"
			color="primary.contrastText"
		>
			<img width="128" alt="logo-original-white" src={LogoOriginalWhite} />

			<DesktopSpacer vertical={6} />

			<Typography variant="h6">{children}</Typography>

			<DesktopSpacer vertical={4} />

			<CircularProgress size={36} style={{ color: 'white' }} />
		</Box>
	);
};
