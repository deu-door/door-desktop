import { AppBar, AppBarProps, Box, Container, Hidden, IconButton, Toolbar } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { default as LogoOriginalWhite } from '../../static/logo/logo-original-white.svg';
import React from 'react';

export type DesktopNavigatorProps = {
	onSideBarOpen: () => void;
	onClickHome: () => void;
} & AppBarProps;

export const DesktopNavigator: React.FC<DesktopNavigatorProps> = props => {
	const { onSideBarOpen, onClickHome, ...appBarProps } = props;

	return (
		<AppBar position="static" {...appBarProps}>
			<Container maxWidth="lg">
				<Toolbar
					style={{
						paddingLeft: 0,
						paddingRight: 0,
					}}
				>
					<Hidden mdUp>
						<IconButton color="inherit" edge="start" onClick={onSideBarOpen}>
							<Menu />
						</IconButton>
						<Box width="0.5rem" />
					</Hidden>

					<IconButton onClick={onClickHome}>
						<img style={{ width: '2.4rem' }} alt="logo-original-white" src={LogoOriginalWhite} />
					</IconButton>
				</Toolbar>
			</Container>
		</AppBar>
	);
};
