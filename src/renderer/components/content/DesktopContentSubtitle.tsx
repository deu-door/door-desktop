import { Box, styled, Typography, TypographyProps } from '@material-ui/core';
import { Visibility } from '@material-ui/icons';
import { Assignment, AssignmentHead, Post, PostHead } from 'door-api';
import React from 'react';
import { useCourse } from '../../hooks/door/useCourse';
import { DesktopDate } from '../common/DesktopDate';
import { DesktopSpacer } from '../common/DesktopSpacer';
import { DesktopContentIcon } from './DesktopContentIcon';

const DesktopAssignmentSubtitleTypography = styled((props: TypographyProps) => (
	<Typography variant="subtitle2" color="textSecondary" {...props} />
))({
	display: 'flex',
	alignItems: 'center',

	'& > *:not(:first-child)::before': {
		paddingLeft: '0.2rem',
		paddingRight: '0.2rem',
		content: `"·"`,
		fontWeight: 'bolder',
	},
});

export type DesktopContentSubtitleProps = TypographyProps & {
	content: (PostHead | Post) | (AssignmentHead | Assignment);
	variant?: boolean;
	course?: boolean;
	author?: boolean;
	views?: boolean;
};

export const DesktopContentSubtitle: React.FC<DesktopContentSubtitleProps> = props => {
	const {
		content,
		variant: showVariant = true,
		course: showCourse = false,
		author: showAuthor = true,
		views: showViews = true,
		...TypographyProps
	} = props;
	const { courseById } = useCourse();

	const course = courseById(content.courseId);

	return (
		<Box display="flex">
			<DesktopAssignmentSubtitleTypography {...TypographyProps}>
				{(showCourse || showVariant) && (
					<Box display="inline-flex">
						{showVariant && <DesktopContentIcon variant={content.variant} fontSize="1rem" />}
						{showCourse && showVariant && <DesktopSpacer horizontal={0.3} />}
						{showCourse && <strong>{course?.name}</strong>}
					</Box>
				)}
				{'author' in content && showAuthor && <span>{content.author}</span>}
				{'views' in content && showViews && (
					<Box display="inline-flex">
						<Visibility style={{ fontSize: '1rem' }} />
						<DesktopSpacer horizontal={0.3} />
						<span>{content.views}</span>
					</Box>
				)}
			</DesktopAssignmentSubtitleTypography>

			<DesktopSpacer horizontal="auto" />

			<DesktopAssignmentSubtitleTypography {...TypographyProps}>
				<DesktopDate
					date={'createdAt' in content ? content.createdAt : 'duration' in content ? content.duration.from : ''}
					fromNow
					tooltip
				/>
			</DesktopAssignmentSubtitleTypography>
		</Box>
	);
};
