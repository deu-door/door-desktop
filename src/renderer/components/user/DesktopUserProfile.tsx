import { Avatar, Box, Dialog, DialogContent, DialogContentText, Link, Tooltip, Typography, useTheme } from '@material-ui/core';
import React, { useState } from 'react';
import { userLogoutURI } from '../../../common/uri/uri';
import { useRequestMetadata } from '../../hooks/request/useRequestMetadata';
import { useUser } from '../../hooks/door/useUser';
import { DesktopRoundedPaper } from '../common/DesktopRoundedPaper';
import { DesktopSpacer } from '../common/DesktopSpacer';
import { DesktopUserLogoutDialog } from './DesktopUserLogoutDialog';
import { CheckCircle, Error } from '@material-ui/icons';

export const DesktopUserProfile: React.FC = () => {
	const theme = useTheme();
	const { user, sessionExpired, logout } = useUser();

	const { requestMetadataByURI } = useRequestMetadata();
	const { pending } = requestMetadataByURI(userLogoutURI());

	const [openDialog, setOpenDialog] = useState(false);

	return (
		<>
			<DesktopRoundedPaper style={{ paddingTop: theme.spacing(1.5), paddingBottom: theme.spacing(1.5) }}>
				{user === undefined ? (
					<>유저 정보를 확인할 수 없습니다</>
				) : (
					<Box display="flex" paddingX={2}>
						<Box>
							<DesktopSpacer vertical={2} />
							<Avatar />
						</Box>
						<DesktopSpacer horizontal={1.5} />
						<Box flex={1}>
							<Typography variant="caption" color="textSecondary">
								{user.major}
							</Typography>
							<Box display="flex" alignItems="baseline">
								<Typography variant="h6">{user.name}</Typography>
								<DesktopSpacer horizontal={0.25} />
								<Tooltip
									placement="top"
									title={
										sessionExpired !== true ? (
											'로그인되어 있습니다'
										) : (
											<Box>
												<Box>로그인 상태를 확인할 수 없습니다.</Box>
												<DesktopSpacer vertical={2} />
												<Box>* 네트워크 또는 서버에 문제가 발생하여 새로고침을 사용할 수 없습니다.</Box>
												<Box>* Door Desktop에 저장되어있는 컨텐츠는 이용할 수 있습니다.</Box>
											</Box>
										)
									}
								>
									<Box alignSelf="flex-end">
										{sessionExpired !== true ? (
											<CheckCircle style={{ fontSize: '1rem' }} />
										) : (
											<Error style={{ fontSize: '1rem' }} color="error" />
										)}
									</Box>
								</Tooltip>
								<DesktopSpacer horizontal={0.75} />
								<Link
									component="button"
									variant="caption"
									color="textSecondary"
									style={{ textDecoration: 'underline' }}
									onClick={() => setOpenDialog(true)}
								>
									로그아웃
								</Link>
							</Box>
							<Typography variant="subtitle2">{user.id}</Typography>
						</Box>
					</Box>
				)}

				<DesktopUserLogoutDialog
					open={openDialog}
					onClose={() => setOpenDialog(false)}
					onConfirm={() => {
						logout();
						setOpenDialog(false);
					}}
				/>

				<Dialog open={pending}>
					<DialogContent>
						<DialogContentText>로그아웃 중입니다...</DialogContentText>
					</DialogContent>
				</Dialog>
			</DesktopRoundedPaper>
		</>
	);
};
