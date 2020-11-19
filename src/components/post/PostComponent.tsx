import { Button, Card, CardActions, CardContent, CardHeader, createStyles, Grid, Link, makeStyles, Paper, PaperProps, TextField, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Attachment, Post, Submission } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { DateTime } from '../core/DateTime';
import { FetchButton } from '../fetchable/FetchButton';
import { Attachment as AttachmentIcon } from '@material-ui/icons';
import { downloader } from 'service/downloader';
import clsx from 'clsx';

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

			{attachments && attachments.map(attachment => <PostAttachment key={attachment.title} attachment={attachment} />)}
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

export const PostAttachment: React.FC<{ attachment: Attachment }> = props => {
	const { attachment } = props;
	const classes = useStyles();

	return (
		<div className={classes.postAttachment}>
			<Grid container spacing={1}>
				<Grid item>
					<AttachmentIcon/>
				</Grid>
				<Grid item zeroMinWidth>
					<Link component="button" onClick={() => downloader.download(attachment.link)}>{attachment.title}</Link>
				</Grid>
			</Grid>
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
			elevation={4} {...paperProps}
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

export const PostSubmission: React.FC<{ submission: Submission }> = props => {
	const { submission } = props;
	const classes = useStyles();

	return (
		<>
			<Typography variant="h6" className={classes.postSubheader}>제출</Typography>

			<TextField
				multiline
				fullWidth
				rows={4}
				variant="outlined"
				disabled
				value={submission.contents}
			/>

			{submission.attachments && submission.attachments.map(attachment => <PostAttachment key={attachment.link} attachment={attachment} />)}
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

							{submission && <PostSubmission submission={submission} />}

							{evaluationResult && <PostEvaluationResult result={evaluationResult} />}
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

