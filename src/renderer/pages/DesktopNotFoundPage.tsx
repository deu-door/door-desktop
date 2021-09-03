import { Box, Button, Typography } from '@material-ui/core';
import React from 'react';
import { useHistory, useLocation } from 'react-router';
import { DesktopSpacer } from '../components/common/DesktopSpacer';

export const DesktopNotFoundPage: React.FC = props => {
	const { children } = props;
	const location = useLocation();
	const history = useHistory();

	return (
		<Box flex={1} bgcolor="primary.main" color="primary.contrastText" padding={6}>
			<Typography variant="h2">NOT FOUND</Typography>
			<DesktopSpacer vertical={2} />
			<Typography variant="subtitle1">{children ?? 'Something went wrong. May unexpected behavior happen!'}</Typography>

			<DesktopSpacer vertical={4} />

			<Typography variant="h5">Location</Typography>
			<pre>{JSON.stringify(location, null, 4)}</pre>

			<DesktopSpacer vertical={4} />

			<Typography variant="h5">History</Typography>
			<pre>{JSON.stringify(history, null, 4)}</pre>

			<Button variant="contained" onClick={() => history.replace('/')} component="button">
				Go to main
			</Button>
		</Box>
	);
};
