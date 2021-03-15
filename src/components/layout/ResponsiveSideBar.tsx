import { Drawer, Hidden, useTheme } from '@material-ui/core';
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
		<nav
			style={{
				[theme.breakpoints.up('md')]: {
					width: width,
					flexShrink: 0,
					position: 'sticky',
					top: 0,
				},
			}}
		>
			<Hidden smDown implementation="css">
				<SideBar width={width} marginRight={3} {...sideBarProps} />
			</Hidden>

			<Hidden mdUp implementation="css">
				<Drawer
					container={container}
					variant="temporary"
					open={open}
					onClose={onClose}
					PaperProps={{ style: { background: 'transparent', boxShadow: 'none', padding: theme.spacing(2) } }}
				>
					<SideBar width={width} {...sideBarProps} />
				</Drawer>
			</Hidden>
		</nav>
	);
};
