import { Typography, CssBaseline } from '@material-ui/core';
import React from 'react';

export const IndexPage: React.FC = () => {
	return (
		<div>
			<CssBaseline />
			<Typography component="h1" variant="h3">Hey, welcome back!</Typography>
		</div>
	);
};