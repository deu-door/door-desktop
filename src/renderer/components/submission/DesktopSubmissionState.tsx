import { Box, Paper, Typography, useTheme } from '@material-ui/core';
import { CheckCircleOutline, ErrorOutline } from '@material-ui/icons';
import { Assignment } from 'door-api';
import React from 'react';
import { DesktopSpacer } from '../common/DesktopSpacer';
import { DesktopSubmissionDuration } from './DesktopSubmissionDuration';

export type DesktopSubmissionStateProps = {
	assignment: Assignment;
};

export const DesktopSubmissionState: React.FC<DesktopSubmissionStateProps> = props => {
	const { assignment } = props;
	const theme = useTheme();

	return (
		<Paper elevation={0} style={{ backgroundColor: assignment.submitted ? theme.palette.success.main : theme.palette.warning.main }}>
			<Box padding="1rem" display="flex" justifyContent="space-between" alignItems="center" color="white">
				<Box display="inline-flex" alignItems="center">
					{assignment.submitted ? <CheckCircleOutline fontSize="large" /> : <ErrorOutline fontSize="large" />}
					<DesktopSpacer horizontal={0.5} />
					<Typography>{assignment.submitted ? '제출 완료' : '미제출'}</Typography>
				</Box>
				<DesktopSubmissionDuration duration={assignment.duration} additionalDuration={assignment.additionalDuration} />
			</Box>
		</Paper>
	);
};
