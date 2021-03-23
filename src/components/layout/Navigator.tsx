import {
	AppBar,
	AppBarProps,
	Avatar,
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Container,
	Dialog,
	DialogActions,
	DialogContent,
	DialogProps,
	DialogTitle,
	Hidden,
	IconButton,
	Toolbar,
	Typography,
	useTheme,
} from '@material-ui/core';
import { Menu } from '@material-ui/icons';
import { default as LogoOriginalWhite } from 'resources/logo-original-white.svg';
import React, { useState } from 'react';
import { useUser } from 'hooks/door/useUser';
import { lightGreen, red } from '@material-ui/core/colors';
import { useHistory } from 'react-router';

export type UserDialogProps = DialogProps;

export const UserDialog: React.FC<UserDialogProps> = props => {
	const { ...otherProps } = props;
	const {
		user: { user },
		logout,
	} = useUser();
	const history = useHistory();
	const theme = useTheme();
	const [showLogoutDialog, setShowLogoutDialog] = useState(false);
	const [pending, setPending] = useState(false);

	const doLogout = async () => {
		setPending(true);
		await logout();
		setPending(false);
		history.replace('/');
	};

	return (
		<>
			<Dialog maxWidth="xs" fullWidth {...otherProps} {...(pending ? { open: false } : {})}>
				<DialogTitle>Door 유저 정보</DialogTitle>
				<DialogContent>
					{user && (
						<Box display="flex" flexDirection="column">
							{[
								{ label: '이름', value: user.name },
								{ label: '학번', value: user.id },
								{ label: '전공', value: user.major },
							].map(({ label, value }) => (
								<Box key={label} marginBottom="0.8rem">
									<Typography variant="subtitle2" color="textSecondary" display="inline">
										{label}
									</Typography>
									<Box width="0.8rem" />
									<Typography variant="h6" display="inline">
										{value}
									</Typography>
								</Box>
							))}
						</Box>
					)}

					<Dialog open={!pending && showLogoutDialog} onClose={() => setShowLogoutDialog(false)}>
						<DialogTitle>정말로 로그아웃하시겠습니까?</DialogTitle>
						<DialogContent>만일 자동 로그인을 사용하신다면, 이후 해제됩니다.</DialogContent>
						<DialogActions>
							<Button onClick={() => setShowLogoutDialog(false)} color="default" size="large">
								취소
							</Button>
							<Button onClick={doLogout} color="primary" size="large">
								확인
							</Button>
						</DialogActions>
					</Dialog>

					<DialogActions>
						<Button fullWidth color="primary" size="large" onClick={() => setShowLogoutDialog(true)}>
							로그아웃
						</Button>
					</DialogActions>
				</DialogContent>
			</Dialog>

			<Backdrop open={pending} style={{ zIndex: theme.zIndex.drawer + 99 }}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</>
	);
};

export type NavigatorProps = {
	onSideBarOpen: () => void;
	onClickHome: () => void;
} & AppBarProps;

export const Navigator: React.FC<NavigatorProps> = props => {
	const { onSideBarOpen, onClickHome, ...appBarProps } = props;
	const {
		user: { user, authenticated },
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

					<UserDialog open={open} onClose={() => setOpen(false)} />

					{user && (
						<>
							<Button
								disabled
								style={{
									marginLeft: 'auto',
									color: authenticated ? lightGreen['A200'] : red['A200'],
									fontWeight: 'bolder',
								}}
							>
								{authenticated ? 'Connected' : 'Disconnected'}
							</Button>
							<Box width="1rem" />
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
