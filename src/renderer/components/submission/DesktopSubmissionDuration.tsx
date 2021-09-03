import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { Assignment } from 'door-api';
import { DesktopDuration } from '../common/DesktopDuration';

export type DesktopSubmissionDurationProps = {
	duration: Assignment['duration'];
	additionalDuration?: Assignment['additionalDuration'];
	interval?: number;
};

export const DesktopSubmissionDuration: React.FC<DesktopSubmissionDurationProps> = props => {
	const { duration, additionalDuration, interval } = props;

	return (
		<Box display="flex" flexDirection="column" alignItems="flex-end">
			<DesktopDuration interval={interval} {...duration} {...(additionalDuration !== undefined ? { variant: 'caption' } : {})} />
			{additionalDuration && (
				<Box>
					<Typography variant="caption" display="inline">
						추가 제출기간:{' '}
					</Typography>
					<DesktopDuration interval={interval} {...additionalDuration} />
				</Box>
			)}
		</Box>
	);
};
