import { useHistory } from 'react-router';
import React, { useState } from 'react';
import {
	Backdrop,
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	DialogProps,
	DialogTitle,
	Typography,
	useTheme,
} from '@material-ui/core';
import { useUser } from 'hooks/door/useUser';

export type UserDetailsDialogProps = DialogProps;

export const UserDetailsDialog: React.FC<UserDetailsDialogProps> = props => {
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
					<Box display="flex">
						<Box width="160px">
							<img alt="유저 이미지" style={{ height: '100%' }} src={user?.image} />
						</Box>
						<Box width="0.8rem" />
						{user && (
							<Box flex={1} display="flex" flexDirection="column">
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
					</Box>

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
