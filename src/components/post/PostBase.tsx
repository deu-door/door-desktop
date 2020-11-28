import { Button, Card, CardActions, CardContent, CardHeader, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import { FetchControl } from 'components/fetchable/FetchControl';
import React, { useState } from 'react';
import { Attachment, Post, Submittable } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { DateTime } from '../core/DateTime';
import { PostAttachment } from './controls/PostAttachment';
import { PostEvaluationResult } from './controls/PostEvaluationResult';
import { PostSubmission } from './controls/PostSubmission';
import { PostTimeProgress } from './controls/PostTimeProgress';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0, 2, 3),
		overflow: 'unset',
		'& .MuiDivider-root': {
			margin: theme.spacing(2, 0)
		}
	},
	postSubheader: {
		margin: theme.spacing(2, 0)
	},
	postContent: {
		'& p:first-child': {
			marginTop: theme.spacing(0)
		},

		'& p:last-child': {
			marginBottom: theme.spacing(0)
		}
	}
}));

export const PostContent: React.FC<{ contents?: string, attachments?: Attachment[] }> = props => {
	const { contents, attachments } = props;
	const classes = useStyles();

	return (
		<>
			{contents && <Typography variant="body2" color="textSecondary" component="span" paragraph>
				<div className={classes.postContent} dangerouslySetInnerHTML={{ __html: contents }} />
			</Typography>}

			{attachments && attachments.length > 0 && <PostAttachment attachments={attachments} />}
		</>
	);
}

export const PostSubheader: React.FC<{ author?: string, views?: number, createdAt: Date|string|number, fetchControl?: React.ReactNode }> = props => {
	const { author, views, createdAt, fetchControl } = props;

	return (
		<Typography variant="subtitle2" color="textSecondary">
			<Grid container spacing={1}>
				{author &&
					<Grid item>
						<span>{author} · </span>
					</Grid>}

				{views !== undefined &&
					<Grid item>
						<span>조회수 {views}회 · </span>
					</Grid>}

				<Grid item>
					<DateTime relative date={createdAt} />
				</Grid>

				{fetchControl &&
					<Grid item>
						{fetchControl}
					</Grid>}
			</Grid>
		</Typography>
	);
}

export type PostBaseProps = {
	post: Post,

	tag?: React.ReactNode,
	summary?: React.ReactNode,

	action?: FetchableAction,
	fetchControl?: React.ReactNode,
	defaultCollapsed?: boolean
};

export const PostBase: React.FC<PostBaseProps> = props => {
	const { post, tag, summary, action, fetchControl, defaultCollapsed = false, children } = props;
	const classes = useStyles();
	const [show, setShow] = useState(!defaultCollapsed);

	return (
		<Card className={classes.post}>
			<Grid container alignItems="center">
				{tag && <Grid item>{tag}</Grid>}
				<Grid item style={{ flex: 1 }}>
					<CardHeader
						title={<Typography variant="h6">{post.title}</Typography>}
						subheader={
							<PostSubheader
								author={post.author}
								views={post.views}
								createdAt={post.createdAt}
								fetchControl={show && (fetchControl || <FetchControl fetchable={post} action={action} />)}
							/>
						}
					/>
				</Grid>
			</Grid>

			{summary && <CardContent>
					{summary}
				</CardContent>}

			{show && post.fulfilled && (children ? children :
				<CardContent>
					<PostContent contents={post.contents} attachments={post.attachments} />
				</CardContent>)}

			{!show &&
				<CardActions>
					<Button size="small" color="primary" onClick={() => setShow(true)}>자세히 보기</Button>
				</CardActions>}
		</Card>
	);
}

export type SubmittablePostBaseProps = {
	post: Post & Submittable
} & PostBaseProps

export const SubmittablePostBase: React.FC<SubmittablePostBaseProps> = props => {
	const { post, action, children, ...postProps } = props;
	const classes = useStyles();

	return (
		<PostBase
			post={post}
			action={action}
			summary={<PostTimeProgress period={post.period} />}

			{...postProps}
		>
			<CardContent>
				<PostContent contents={post.contents} attachments={post.attachments} />

				{post.submission &&
					<>
						<Divider />
						<Typography variant="h6" className={classes.postSubheader}>제출</Typography>
						<PostSubmission submission={post.submission} actionAfterSubmit={action} />
					</>}

				{post.evaluationResult &&
					<>
						<Divider />
						<Typography variant="h6" className={classes.postSubheader}>평가결과</Typography>
						<PostEvaluationResult result={post.evaluationResult} />
					</>}
			</CardContent>
		</PostBase>
	);
}