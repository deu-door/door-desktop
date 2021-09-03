import { Box, Typography } from '@material-ui/core';
import React from 'react';
import { PACKAGE_AUTHOR, PACKAGE_REPOSITORY_URL } from '../../common/constants';
import { DesktopSpacer } from '../components/common/DesktopSpacer';

// const { shell } = window.require('electron');

export const DesktopFooter: React.FC = props => {
	return (
		<Box display="flex" flexDirection="column" minHeight="96px">
			<Typography variant="caption" color="textSecondary">
				Authored by {PACKAGE_AUTHOR}. project link: {PACKAGE_REPOSITORY_URL}
			</Typography>

			<DesktopSpacer vertical={1.2} />

			{/* <Typography color="textSecondary" variant="body2">
				<span>외부 링크 :</span>
				{externalLinks.map(externalLink => (
					<Link
						key={externalLink.url}
						href="#"
						color="inherit"
						onClick={() => shell.openExternal(externalLink.url)}
						style={{ marginLeft: '0.5rem' }}
					>
						{externalLink.label}
					</Link>
				))}
			</Typography> */}
		</Box>
	);
};
