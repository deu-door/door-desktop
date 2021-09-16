import { alpha, ListItemText } from '@material-ui/core';
import { Assignment, AssignmentHead, Post, PostHead } from 'door-api';
import { DesktopBorderedListItem } from '../common/DesktopBorderedListItem';
import React from 'react';
import { DesktopContentSubtitle, DesktopContentSubtitleProps } from './DesktopContentSubtitle';
import { DesktopContentTitle, DesktopContentTitleProps } from './DesktopContentTitle';
import { yellow } from '@material-ui/core/colors';

export type DesktopContentListItemProps = {
	content: (PostHead | Post) | (AssignmentHead | Assignment);
	TitleProps?: Partial<DesktopContentTitleProps>;
	SubtitleProps?: Partial<DesktopContentSubtitleProps>;
	onClick?: () => void;
};

export const DesktopContentListItem: React.FC<DesktopContentListItemProps> = props => {
	const { content, onClick, TitleProps, SubtitleProps } = props;

	return (
		<DesktopBorderedListItem
			button
			onClick={onClick}
			style={{
				backgroundColor: 'noted' in content && content.noted === false ? alpha(yellow[500], 0.25) : undefined,
			}}
		>
			<ListItemText
				primary={
					<DesktopContentTitle
						content={content}
						variant="subtitle1"
						style={{ textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
						{...TitleProps}
					/>
				}
				secondary={<DesktopContentSubtitle content={content} {...SubtitleProps} />}
				secondaryTypographyProps={{ color: 'inherit' }}
				color="inherit"
			/>
		</DesktopBorderedListItem>
	);
};
