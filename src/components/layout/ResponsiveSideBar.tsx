import { Box, Drawer, Hidden, useTheme } from '@material-ui/core';
import React from 'react';
import { SideBar, SideBarProps } from './SideBar';

export type ResponsiveSideBarProps = {
	open: boolean;
	onClose: () => void;
} & SideBarProps;

export const ResponsiveSideBar: React.FC<ResponsiveSideBarProps> = props => {
	const { open, onClose, width = 220, ...sideBarProps } = props;
	const theme = useTheme();

	// drawer's mount destination
	const container = window !== undefined ? () => window.document.body : undefined;

	return (
		<nav>
			<Hidden smDown implementation="css">
				<Box width={width} marginRight="2rem">
					<SideBar width={width} marginRight={3} position="fixed" {...sideBarProps} />
				</Box>
			</Hidden>

			<Hidden mdUp implementation="css">
				<Drawer
					container={container}
					variant="temporary"
					open={open}
					onClose={onClose}
					PaperProps={{ style: { background: 'transparent', boxShadow: 'none' } }}
				>
					<SideBar width={width} style={{ marginTop: theme.spacing(6), marginLeft: theme.spacing(2) }} {...sideBarProps} />
				</Drawer>
			</Hidden>
		</nav>
	);
};
