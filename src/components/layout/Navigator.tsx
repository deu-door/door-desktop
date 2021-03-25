import { AppBar, AppBarProps, Avatar, Box, Button, Container, Hidden, IconButton, Toolbar, Tooltip, Typography } from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { default as LogoOriginalWhite } from 'resources/logo-original-white.svg';
import React, { useState } from 'react';
import { useUser } from 'hooks/door/useUser';
import { red } from '@material-ui/core/colors';
import { UserDetailsDialog } from 'components/dialog/UserDetailsDialog';

export type NavigatorProps = {
	onSideBarOpen: () => void;
	onClickHome: () => void;
} & AppBarProps;

export const Navigator: React.FC<NavigatorProps> = props => {
	const { onSideBarOpen, onClickHome, ...appBarProps } = props;
	const {
		user: { user, authenticated, error, pending },
		loginWithSavedCredential,
	} = useUser();
	const [open, setOpen] = useState(false);

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

					<UserDetailsDialog open={open} onClose={() => setOpen(false)} />

					{user && (
						<>
							<Box marginLeft="auto" />
							{authenticated === false && (
								<>
									<Tooltip title="서버와 연결할 수 없거나 로그인이 끊어진 것 같아요. 눌러서 상태를 갱신하세요." arrow>
										<Button
											disabled={pending}
											onClick={loginWithSavedCredential}
											style={{
												color: red['A200'],
												fontWeight: 'bolder',
											}}
										>
											{pending ? '로그인 상태 확인 중 ...' : error !== undefined ? error : 'Disconnected'}
										</Button>
									</Tooltip>
									<Box width="1rem" />
								</>
							)}
							<Button onClick={() => setOpen(true)} color="inherit">
								<Box display="flex" flexDirection="column" alignItems="flex-end" marginRight="0.8rem">
									<Typography variant="subtitle2">{user.name}</Typography>
									<Typography variant="caption">{user.major}</Typography>
								</Box>
								<Avatar />
							</Button>
						</>
					)}
				</Toolbar>
			</Container>
		</AppBar>
	);
};
