import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, createStyles, Divider, Grid, Link, List, ListItem, ListItemIcon, ListItemText, makeStyles, TextField, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { Attachment, Post } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { DateTime } from './DateTime';
import { FetchButton } from './FetchButton';
import { Attachment as AttachmentIcon } from '@material-ui/icons';
import { actions } from 'store/modules';
import { Assignment } from 'service/door/interfaces/assignment';
import { Notice } from 'service/door/interfaces/notice';
import { Lecture } from 'service/door/interfaces/lecture';
import { downloader } from 'service/downloader';
import { Reference } from 'service/door/interfaces/reference';
import VisibilitySensor from 'react-visibility-sensor';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0)
	},
	postDivider: {
		margin: theme.spacing(2, 0)
	},
	postSubheader: {
		margin: theme.spacing(2, 0)
	},
	postAttachment: {
		margin: theme.spacing(2, 0)
	}
}));

export const PostContent: React.FC<{ content: string }> = props => {
	const { content } = props;

	return (
		<Typography variant="body2" color="textSecondary" component="span" paragraph>
			<div dangerouslySetInnerHTML={{ __html: content }} />
		</Typography>
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

export type PostComponentProps = { post: Post, action?: FetchableAction, defaultCollapsed?: boolean };

export const PostComponent: React.FC<PostComponentProps> = props => {
	const { post, action, defaultCollapsed = false, children } = props;
	const classes = useStyles();
	const [show, setShow] = useState(!defaultCollapsed);

	const subheader = [
		post.author,
		post.views ? '조회수 ' + post.views + '회' : null
	].filter(d => !!d).join(' · ');

	return (
		<Card className={classes.post}>
			<CardHeader
				title={post.title}
				subheader={<span>{subheader}{post.createdAt && <span> · <DateTime relative date={post.createdAt} /></span>}</span>}
			/>

			{show ?
				<div>
					{children ? children : post.contents &&
						<CardContent>
							<PostContent content={post.contents} />
								{post.attachments && post.attachments.map(attachment => <PostAttachment key={attachment.link} attachment={attachment} />)}
						</CardContent>}

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
};

export const AssignmentComponent: React.FC<Omit<PostComponentProps, 'post'> & { assignment: Assignment }> = props => {
	const { assignment, ...postProps } = props;
	const classes = useStyles();

	return (
		<PostComponent {...postProps} post={assignment} action={actions.assignment(assignment.courseId, assignment.id)}>
			<CardContent>
				{assignment.contents && <PostContent content={assignment.contents} />}

				{assignment.attachments && assignment.attachments.map(attachment => <PostAttachment key={attachment.link} attachment={attachment} />)}

				<Divider className={classes.postDivider} />

				<Typography variant="h6" className={classes.postSubheader}>제출</Typography>

				<TextField
					multiline
					fullWidth
					rows={4}
					variant="outlined"
					value={assignment.submittedContents}
				/>

				{assignment.submittedAttachments && assignment.submittedAttachments.map(attachment => <PostAttachment key={attachment.link} attachment={attachment} />)}

				{assignment.result && <div>
					<Divider className={classes.postDivider} />
					<Typography variant="h6" className={classes.postSubheader}>평가결과</Typography>
					<Grid container spacing={2} alignItems="center">
						{assignment.result.score && <Grid item>
							<Typography variant="h4">{assignment.result.score}점</Typography>
						</Grid>}
						{assignment.result.comment && <Grid item zeroMinWidth>
							<Typography variant="body2">{assignment.result.comment}</Typography>
						</Grid>}
					</Grid>
				</div>}
			</CardContent>
		</PostComponent>
	);
}

export const NoticeComponent: React.FC<Omit<PostComponentProps, 'post'> & { notice: Notice }> = props => {
	const { notice, ...postProps } = props;

	return (
		<PostComponent {...postProps} post={notice} action={actions.notice(notice.courseId, notice.id)} />
	);
}

export const ReferenceComponent: React.FC<Omit<PostComponentProps, 'post'> & { reference: Reference }> = props => {
	const { reference, ...postProps } = props;

	return (
		<PostComponent {...postProps} post={reference} action={actions.reference(reference.courseId, reference.id)} />
	);
}

export const LectureComponent: React.FC<Omit<PostComponentProps, 'post'> & { lecture: Lecture }> = props => {
	const { lecture, ...postProps } = props;
	const [linkType, setLinkType] = useState('');
	const [lazyLoad, setLazyLoad] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			if(await downloader.isDownloadable(lecture.link)) {
				setLinkType('downloadable');
			}else{
				setLinkType('html');
			}
		};

		lazyLoad && fetch();
	}, [lazyLoad, lecture.link]);

	return (
		<PostComponent {...postProps} post={lecture}>
			<VisibilitySensor onChange={isVisible => isVisible && setLazyLoad(true)}>
				<div>
					{lecture.link && linkType === 'html' &&
						<CardMedia>
							<iframe
								title={lecture.title}
								src={lecture.link}
								width="100%"
								height="480"
								allowFullScreen
								frameBorder="0"
							/>
						</CardMedia>}

					<CardContent>
						{lecture.contents && <PostContent content={lecture.contents} />}

						{lecture.link && linkType === 'downloadable' &&
							<PostAttachment attachment={{
								title: '첨부파일',
								link: lecture.link
							}} />}
					</CardContent>
				</div>
			</VisibilitySensor>
		</PostComponent>
	);
}