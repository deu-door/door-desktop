import { Button, Card, CardActions, CardContent, CardHeader, createStyles, Divider, Grid, makeStyles, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { Attachment, Post, Submission } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { DateTime } from '../core/DateTime';
import { FetchButton } from '../fetchable/FetchButton';
import { PostAttachment } from './controls/PostAttachment';
import { PostEvaluationResult } from './controls/PostEvaluationResult';
import { PostSubmission } from './controls/PostSubmission';

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
};

export const PostSubheader: React.FC<{ author?: string, views?: number, createdAt: Date|string|number }> = props => {
	const { author, views, createdAt } = props;

	return (
		<Typography variant="subtitle2" color="textSecondary">
			{author && <span>{author} · </span>}
			{views !== undefined && <span>조회수 {views}회 · </span>}
			<DateTime relative date={createdAt} />
		</Typography>
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

	return (
		<Card className={classes.post}>
			<Grid container alignItems="center">
				{tag && <Grid item>{tag}</Grid>}
				<Grid item style={{ flex: 1 }}>
					<CardHeader
						title={<Typography variant="h6">{post.title}</Typography>}
						subheader={<PostSubheader author={post.author} views={post.views} createdAt={post.createdAt} />}
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
								<Typography variant="h6" className={classes.postSubheader}>제출</Typography>
								<PostSubmission submission={submission} actionAfterSubmit={action} />
							</>}

							{evaluationResult && <>
								<Divider />
								<Typography variant="h6" className={classes.postSubheader}>평가결과</Typography>
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

