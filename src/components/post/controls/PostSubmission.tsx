import { Button, Grid, TextField } from '@material-ui/core';
import React, { useState } from 'react';
import { useDispatch } from 'react-redux';
import { Submission } from 'service/door/interfaces';
import { submitForm } from 'service/door/util';
import { FetchableAction } from 'store/modules';
import { PostAttachment } from './PostAttachment';

export type PostSubmissionProps = {
	submission: Submission,
	editable?: boolean,
	actionAfterSubmit?: FetchableAction
};

export const PostSubmission: React.FC<PostSubmissionProps> = props => {
	const { submission, editable = true, actionAfterSubmit } = props;
	const dispatch = useDispatch();
	const [files, setFiles] = useState<File[]>([]);
	const [edit, setEdit] = useState(false);
	const [pending, setPending] = useState(false);

	const contentsRef = React.createRef<HTMLInputElement>();

	const attachments = submission.attachments;

	const onCancel = () => {
		setEdit(false);
		if(contentsRef.current) contentsRef.current.value = submission.contents;
	};

	const onSubmit = async () => {
		setEdit(false);

		// Copy a form
		const form = Object.assign({}, submission.form);
		form.contents = contentsRef.current?.value || '';

		// Multiple file does not support.
		if(files.length > 0) form.file = files[0];

		setPending(true);
		await submitForm(form);

		// Test upload was successful
		if(actionAfterSubmit) await dispatch(actionAfterSubmit.fetch());

		setPending(false);

		// Files are uploaded. Clear user input
		setFiles([]);
	};

	return (
		<>
			<TextField
				multiline
				fullWidth
				rows={edit ? 4 : 2}
				variant="outlined"
				disabled={!edit}
				defaultValue={submission.contents}
				inputRef={contentsRef}
			/>

			{attachments && <PostAttachment
				upload={edit}
				attachments={files.length > 0 ? [] : attachments}
				onChange={files => setFiles(files)}
				deleteButton={edit}
			/>}

			{editable && (
				pending === true ?
					<span>제출 중...</span>
				: edit === false ?
					<Button
						size="small"
						variant="contained"
						color="primary"
						onClick={() => setEdit(true)}
					>편집</Button>
				:
					<Grid container spacing={1}>
						<Grid item>
							<Button
								size="small"
								variant="contained"
								color="primary"
								onClick={onSubmit}
							>제출</Button>
						</Grid>

						<Grid item>
							<Button
								size="small"
								variant="contained"
								color="default"
								onClick={onCancel}
							>취소</Button>
						</Grid>
					</Grid>
			)}
		</>
	);
}