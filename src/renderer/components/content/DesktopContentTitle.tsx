import { Box, Tooltip, Typography, TypographyProps } from '@material-ui/core';
import { Done, ErrorOutline, Timer } from '@material-ui/icons';
import { Assignment, AssignmentHead, Post, PostHead } from 'door-api';
import React from 'react';
import { DesktopDuration } from '../common/DesktopDuration';
import { DesktopSpacer } from '../common/DesktopSpacer';

export type DesktopContentTitleProps = TypographyProps & {
	content: (PostHead | Post) | (AssignmentHead | Assignment);
};

export const DesktopContentTitle: React.FC<DesktopContentTitleProps> = props => {
	const { content, ...TypographyProps } = props;

	return (
		<Typography variant="h5" {...TypographyProps}>
			<Box display="flex">
				<Box overflow="hidden" textOverflow="ellipsis">
					{content.title}
				</Box>

				<DesktopSpacer horizontal={1} />
				<DesktopSpacer horizontal="auto" />

				{'duration' in content && (
					<Box display="flex" alignItems="center">
						<Typography style={{ fontSize: '0.9em' }}>
							<DesktopDuration from={content.duration.from} to={content.duration.to} tooltip />
						</Typography>

						<DesktopSpacer horizontal="0.5em" />

						<Box
							display="inherit"
							visibility={'submitted' in content ? 'visible' : 'hidden'}
							fontSize="1.2em"
							color={'submitted' in content && content.submitted ? 'success.main' : 'warning.main'}
						>
							<Tooltip placement="top" title={'submitted' in content && content.submitted ? '제출완료' : '미제출'}>
								{'submitted' in content && content.submitted === true ? (
									<Done fontSize="inherit" />
								) : (
									<ErrorOutline fontSize="inherit" />
								)}
							</Tooltip>
						</Box>
					</Box>
				)}
			</Box>
		</Typography>
	);
};
