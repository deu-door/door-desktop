import { Button, ButtonProps, useTheme } from '@material-ui/core';
import { Attachment } from 'door-api';
import React from 'react';
import { Attachment as AttachmentIcon } from '@material-ui/icons';
import { useDownload } from '../../hooks/download/useDownload';

export type DesktopAttachmentProps = ButtonProps & {
	attachment: Attachment;
};

export const DesktopAttachment: React.FC<DesktopAttachmentProps> = props => {
	const { attachment, ...ButtonProps } = props;
	const { startDownload } = useDownload();

	return (
		<Button
			component="button"
			variant="contained"
			color="default"
			size="small"
			startIcon={<AttachmentIcon />}
			disableElevation
			onClick={() => startDownload(attachment)}
			{...ButtonProps}
		>
			{attachment.title}
		</Button>
	);
};

export type DesktopAttachmentListProps = {
	attachments: Attachment[];
};

export const DesktopAttachmentList: React.FC<DesktopAttachmentListProps> = props => {
	const { attachments } = props;
	const theme = useTheme();

	return (
		<>
			{attachments.map((attachment, index) => (
				<DesktopAttachment
					key={index}
					attachment={attachment}
					style={{ marginLeft: theme.spacing(0.5), marginBottom: theme.spacing(0.5) }}
				/>
			))}
		</>
	);
};
