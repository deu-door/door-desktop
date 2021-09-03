import { ArrowBack } from '@material-ui/icons';
import { useHistory } from 'react-router';
import React from 'react';
import { Button } from '@material-ui/core';

export const DesktopPreviousButton: React.FC = () => {
	const history = useHistory();

	return (
		<Button
			disableElevation
			variant="contained"
			color="primary"
			size="small"
			startIcon={<ArrowBack />}
			onClick={() => history.goBack()}
		>
			이전으로
		</Button>
	);
};
