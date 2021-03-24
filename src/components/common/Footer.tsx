import { Box, Link, Typography } from '@material-ui/core';
import { useOnlineResources } from 'hooks/online-resources/useOnlineResources';
import React from 'react';

const { shell } = window.require('electron');

export const Footer: React.FC = props => {
	const { externalLinks } = useOnlineResources();

	return (
		<Box display="flex" flexDirection="column" minHeight="96px">
			<Typography variant="caption" color="textSecondary">
				Authored by solo5star. project link: https://github.com/deu-door/door-desktop
			</Typography>

			<Box height="1.2rem" />

			<Typography color="textSecondary" variant="body2">
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
			</Typography>
		</Box>
	);
};
