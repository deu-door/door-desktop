import { Button, Dialog, DialogActions, DialogContent, DialogProps, DialogTitle } from '@material-ui/core';
import React from 'react';
import { useUser } from '../../hooks/door/useUser';

export type DesktopUserLogoutDialogProps = DialogProps & {
	onClose?: () => void;
	onConfirm?: () => void;
};

export const DesktopUserLogoutDialog: React.FC<DesktopUserLogoutDialogProps> = props => {
	const { onClose, onConfirm } = props;
	const { persistCredential } = useUser();

	return (
		<Dialog {...props}>
			<DialogTitle>정말로 로그아웃하시겠습니까?</DialogTitle>
			{persistCredential === true && <DialogContent>*로그아웃 시, 자동 로그인이 해제됩니다.</DialogContent>}
			<DialogActions>
				<Button onClick={() => onClose?.()} color="default" size="large">
					취소
				</Button>
				<Button onClick={onConfirm} color="primary" size="large">
					확인
				</Button>
			</DialogActions>
		</Dialog>
	);
};
