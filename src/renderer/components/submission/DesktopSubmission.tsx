import { Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, IconButton, TextField } from '@material-ui/core';
import { Add, Delete } from '@material-ui/icons';
import { Alert } from '@material-ui/lab';
import { Attachment, Assignment } from 'door-api';
import React, { createRef, useEffect, useState } from 'react';
import { runEvery, cancelRun } from '../../../common/helper/schedule';
import { DesktopAttachment } from '../common/DesktopAttachment';
import { DesktopSpacer } from '../common/DesktopSpacer';

type DesktopDeleteFileDialogProps = {
	attachment: Attachment;
	open?: boolean;
	onClose?: () => void;
	onDelete: (attachment: Attachment) => void;
};

const DesktopDeleteFileDialog: React.FC<DesktopDeleteFileDialogProps> = props => {
	const { attachment, open, onClose, onDelete } = props;

	return (
		<Dialog open={open === true} onClose={onClose}>
			<DialogContent>
				<strong>{attachment.title}</strong> 파일을 정말로 삭제하시겠습니까?
			</DialogContent>
			<DialogActions>
				<Button onClick={onClose} color="primary">
					취소
				</Button>
				<Button onClick={() => onDelete(attachment)} color="primary">
					삭제
				</Button>
			</DialogActions>
		</Dialog>
	);
};

export type DesktopSubmissionProps = {
	assignment: Assignment;
};

export const DesktopSubmission: React.FC<DesktopSubmissionProps> = props => {
	const { assignment } = props;

	const [now, setNow] = useState(new Date().toISOString());
	const [editEnabled, setEditEnabled] = useState(false);
	const [contents, setContents] = useState<string | undefined>(undefined);
	const [file, setFile] = useState<File | undefined>(undefined);
	const [pending, setPending] = useState(false);
	const [openDeleteFileDialog, setOpenDeleteFileDialog] = useState(false);

	const fileInputRef = createRef<HTMLInputElement>();

	// refresh current time every 30 seconds
	useEffect(() => {
		const timer = runEvery(() => setNow(new Date().toISOString()), 30000);

		return () => cancelRun(timer);
	}, []);

	// handle file input
	const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFile(event.target.files?.[0]);
	};

	const onDeleteFile = async (attachment: Attachment) => {
		setOpenDeleteFileDialog(false);

		// await driver.post('/Common/FileDeleteNew', { fno: link.match(/\d+$/)?.[0] });
		// await fetchPost(post);
	};

	const clear = () => {
		setContents(undefined);
		setFile(undefined);
		setEditEnabled(false);
	};

	const submit = async () => {
		setEditEnabled(false);
		setPending(true);

		// await putSubmission({
		// 	...post,

		// 	form: {
		// 		contents: contents ?? post.submission.contents,
		// 		file: file,
		// 	},
		// });
		// await fetchPost(post);

		clear();
		setPending(false);
	};

	const canEdit =
		// check for default duration
		(assignment.duration.from < now && now < assignment.duration.to) ||
		// check for additional Duration
		(assignment.additionalDuration !== undefined && assignment.additionalDuration.from < now && now < assignment.additionalDuration.to);

	const editing = editEnabled && !pending;

	return (
		<>
			<TextField
				multiline
				variant="outlined"
				rows={3}
				placeholder="내용을 입력해주세요 ..."
				value={contents ?? assignment.submission.contents}
				onChange={event => setContents(event.target.value)}
				disabled={!editing}
				fullWidth
			/>
			<DesktopSpacer vertical={1} />
			<Box>
				{assignment.submission.attachments.map(attachment => (
					<Box key={attachment.url} marginRight="0.5rem" marginBottom="1rem" display="inline-block">
						<DesktopAttachment attachment={attachment} />
						{editing && (
							<>
								<Box width="0.5rem" display="inline-block" />
								{/* TODO: IMPORTANT: add delete modal */}
								<IconButton size="small" onClick={() => setOpenDeleteFileDialog(true)}>
									<Delete />
								</IconButton>
							</>
						)}
						<DesktopDeleteFileDialog
							attachment={attachment}
							open={openDeleteFileDialog}
							onClose={() => setOpenDeleteFileDialog(false)}
							onDelete={onDeleteFile}
						/>
					</Box>
				))}
				{editEnabled && assignment.submission.attachments.length === 0 && (
					<>
						{file !== undefined && (
							<Box marginRight="0.5rem" display="inline-block">
								<DesktopAttachment attachment={{ title: file.name, referrer: 'http://door.deu.ac.kr', url: '#' }} />
							</Box>
						)}

						<Box marginBottom="1rem" display="inline-block">
							<input type="file" onChange={onFileChange} ref={fileInputRef} hidden />

							<Button
								variant="contained"
								color="secondary"
								size="small"
								startIcon={<Add />}
								disabled={!editing}
								onClick={() => fileInputRef.current?.click()}
							>
								파일 업로드
							</Button>
						</Box>
					</>
				)}
			</Box>

			<Alert severity="warning">
				현재 버전에서는 과제 제출을 지원하지 않습니다. 다음 버전에서 지원 예정이오니 참고 부탁드립니다.
			</Alert>

			{/* {pending ? (
				<CircularProgress />
			) : editEnabled ? (
				<>
					<Button variant="contained" color="primary" onClick={submit}>
						제출
					</Button>
					<Box display="inline-block" width="1rem" />
					<Button variant="contained" color="default" onClick={clear}>
						취소
					</Button>
				</>
			) : (
				<>
					<Button variant="contained" color="primary" disabled={!canEdit} onClick={() => setEditEnabled(true)}>
						편집
					</Button>
				</>
			)} */}
		</>
	);
};
