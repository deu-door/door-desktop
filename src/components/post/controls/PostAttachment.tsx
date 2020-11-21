import { createStyles, Grid, IconButton, Link, makeStyles } from '@material-ui/core';
import { Attachment as AttachmentIcon, Clear, Publish } from '@material-ui/icons';
import React, { useState } from 'react';
import { Attachment } from 'service/door/interfaces';
import { downloader } from 'service/downloader';

const useStyles = makeStyles(theme => createStyles({
	postAttachment: {
		margin: theme.spacing(2, 0)
	}
}));

type PostFileProps = {
	name: string,
	link?: string,
	deleteButton?: boolean,
	onDelete?: () => void
}

const PostFile: React.FC<PostFileProps> = props => {
	const { name, link, deleteButton = false, onDelete } = props;

	return (
		<Grid container spacing={1}>
			<Grid item>
				<AttachmentIcon />
			</Grid>
			<Grid item>
				{link ? <Link component="button" onClick={() => downloader.download(link)}>{name}</Link> : name}
			</Grid>
			{deleteButton && <Grid item>
				<IconButton color="primary" title="삭제" size="small" onClick={() => onDelete?.()}>
					<Clear />
				</IconButton>
			</Grid>}
		</Grid>
	);
}

export type PostAttachmentProps = {
	attachments: Attachment[],
	upload?: boolean,
	deleteButton?: boolean,
	onChange?: (files: File[]) => void
}

export const PostAttachment: React.FC<PostAttachmentProps> = props => {
	const { attachments, upload = false, deleteButton = false, onChange } = props;
	const classes = useStyles();
	const inputRef = React.createRef<HTMLInputElement>();

	const [files, setFiles] = useState<File[]>([]);

	const internalOnChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		// Allows single file upload. Limitation of door system.
		const file = event.target.files?.[0];
		const nextFiles: File[] = file ? [file] : [];

		setFiles(nextFiles);
		onChange?.(nextFiles);
	}

	const internalOnDelete = (file: File) => () => {
		const nextFiles = files.filter(_file => _file !== file);
		if(inputRef.current) inputRef.current.value = '';

		setFiles(nextFiles);
		onChange?.(nextFiles)
	}

	return (
		<div className={classes.postAttachment}>
			{attachments.map(attachment => (
				<PostFile
					key={attachment.link}
					name={attachment.title}
					link={attachment.link}
					deleteButton={deleteButton}
				/>
			))}

			{files.map(file => (
				<PostFile
					key={file.name}
					name={file.name}
					onDelete={internalOnDelete(file)}
					deleteButton={deleteButton}
				/>
			))}

			{upload && <Grid container spacing={1}>
				<Grid item>
					<Publish />
				</Grid>
				<Grid item>
					<input type="file" onChange={internalOnChange} ref={inputRef} hidden />
					<Link component="button" onClick={() => inputRef.current?.click()} >파일 업로드</Link>
				</Grid>
			</Grid>}
		</div>
	);
}