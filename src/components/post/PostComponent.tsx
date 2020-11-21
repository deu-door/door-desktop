import { Button, Card, CardActions, CardContent, CardHeader, createStyles, Divider, Grid, IconButton, Link, makeStyles, Paper, PaperProps, TextField, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Attachment, Post, Submission } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { DateTime } from '../core/DateTime';
import { FetchButton } from '../fetchable/FetchButton';
import { Attachment as AttachmentIcon, Clear, Publish } from '@material-ui/icons';
import { downloader } from 'service/downloader';
import clsx from 'clsx';
import { submitForm } from 'service/door/util';
import { useDispatch } from 'react-redux';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0, 2, 3),
		overflow: 'unset'
	},
	'& .MuiDivider-root': {
		margin: theme.spacing(2, 0)
	},
	postSubheader: {
		margin: theme.spacing(2, 0)
	},
	postAttachment: {
		margin: theme.spacing(2, 0)
	},
	postTag: {
		padding: theme.spacing(1),
		margin: theme.spacing(2, 0, 0, -2),
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		display: 'inline-block'
	}
}));

export const PostContent: React.FC<{ contents: string, attachments?: Attachment[] }> = props => {
	const { contents, attachments } = props;

	return (
		<>
			{contents && <Typography variant="body2" color="textSecondary" component="span" paragraph>
				<div dangerouslySetInnerHTML={{ __html: contents }} />
			</Typography>}

			{attachments && <PostAttachment attachments={attachments} />}
		</>
	);
}

export const PostInformation: React.FC<{ name: string, description: string }> = props => {
	const { name, description } = props;

	return (
		<div>
			<Typography variant="subtitle2">{name}</Typography>
			<Typography variant="body2">{description}</Typography>
		</div>
	);
}

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
				<AttachmentIcon/>
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

type PostAttachmentProps = {
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

export const PostTag: React.FC<PaperProps & { name?: string, color: string, icon: React.ReactElement }> = props => {
	const classes = useStyles();
	const { name, icon, children, className, color, ...paperProps } = props;

	return (
		<Paper
			style={{ background: color }}
			className={clsx(classes.postTag, className)}
			elevation={4}
			{...paperProps}
		>
			{children ? children :
				<Grid container direction="column" alignItems="center">
					<Grid item>
						{icon}
					</Grid>
					<Grid item>
						<Typography variant="subtitle2" color="inherit">{name}</Typography>
					</Grid>
				</Grid>
			}
		</Paper>
	);
}

export type PostSubmissionProps = {
	submission: Submission,
	editable?: boolean,
	actionAfterSubmit?: FetchableAction
};

export const PostSubmission: React.FC<PostSubmissionProps> = props => {
	const { submission, editable = true, actionAfterSubmit } = props;
	const classes = useStyles();
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
			<Typography variant="h6" className={classes.postSubheader}>제출</Typography>

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

export const PostEvaluationResult: React.FC<{ result: { score?: number, comment?: string } }> = props => {
	const { result } = props;
	const classes = useStyles();

	return (
		<>
			<Typography variant="h6" className={classes.postSubheader}>평가결과</Typography>
			<Grid container spacing={2} alignItems="center">
				{result.score && <Grid item>
					<Typography variant="h4">{result.score}점</Typography>
				</Grid>}

				{result.comment && <Grid item zeroMinWidth>
					<Typography variant="body2">{result.comment}</Typography>
				</Grid>}
			</Grid>
		</>
	);
}

export type PostComponentProps = {
	post: Post,
	tag?: React.ReactElement,
	action?: FetchableAction,
	defaultCollapsed?: boolean,

	submission?: Submission,
	evaluationResult?: { score?: number, comment?: string }
};

export const PostComponent: React.FC<PostComponentProps> = props => {
	const { post, tag, action, defaultCollapsed = false, submission, evaluationResult, children } = props;
	const classes = useStyles();
	const [show, setShow] = useState(!defaultCollapsed);

	const subheader = [
		post.author,
		post.views ? '조회수 ' + post.views + '회' : null
	].filter(d => !!d).join(' · ');

	return (
		<Card className={classes.post}>
			<Grid container>
				{tag && <Grid item>{tag}</Grid>}
				<Grid item style={{ flex: 1 }}>
					<CardHeader
						title={post.title}
						subheader={<span>{subheader}{post.createdAt && <span> · <DateTime relative date={post.createdAt} /></span>}</span>}
					/>
				</Grid>
			</Grid>

			{show ?
				<div>
					{post.fulfilled && children ? children : post.contents &&
						<CardContent>
							<PostContent contents={post.contents} attachments={post.attachments} />

							{submission && <>
								<Divider />
								<PostSubmission submission={submission} actionAfterSubmit={action} />
							</>}

							{evaluationResult && <>
								<Divider />
								<PostEvaluationResult result={evaluationResult} />
							</>}
						</CardContent>
					}

					{action &&
						<CardActions>
							<FetchButton fetchable={post} action={action} />
						</CardActions>}
				</div>
				:
				<CardActions>
					<Button size="small" color="primary" onClick={() => setShow(true)}>자세히 보기</Button>
				</CardActions>
			}
		</Card>
	);
}

