import { Button, Card, CardActions, CardContent, CardHeader, CardMedia, createStyles, Divider, Grid, Link, Icon, makeStyles, Paper, PaperProps, TextField, Typography } from '@material-ui/core';
import React, { IframeHTMLAttributes, useEffect, useState } from 'react';
import { Attachment, Post } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { DateTime } from './DateTime';
import { FetchButton } from './FetchButton';
import { Announcement, AssignmentLate, Attachment as AttachmentIcon, Description, OndemandVideo } from '@material-ui/icons';
import { actions } from 'store/modules';
import { Assignment } from 'service/door/interfaces/assignment';
import { Notice } from 'service/door/interfaces/notice';
import { Lecture } from 'service/door/interfaces/lecture';
import { downloader } from 'service/downloader';
import { Reference } from 'service/door/interfaces/reference';
import VisibilitySensor from 'react-visibility-sensor';
import { deepOrange, indigo, purple, teal } from '@material-ui/core/colors';
import clsx from 'clsx';
import ReactDOM from 'react-dom';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0, 2, 3),
		overflow: 'unset'
	},
	postDivider: {
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
	},
	noticeTag: {
		background: indigo[500]
	},
	lectureTag: {
		background: purple[500]
	},
	assignmentTag: {
		background: teal[500]
	},
	referenceTag: {
		background: deepOrange[500]
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

export const PostTag: React.FC<PaperProps & { name?: string, icon: React.ReactElement }> = props => {
	const classes = useStyles();
	const { name, icon, children, className, ...paperProps } = props;

	return (<Paper className={clsx(classes.postTag, className)} elevation={4} {...paperProps}>
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
	</Paper>);
}

export const ResponsiveIFrame: React.FC<{ link: string }> = props => {
	const { link } = props;

	return (
		<div style={{ width: '100%', height: '0', paddingBottom: '56.25%', position: 'relative' }}>
			<div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
				<iframe
					title={link}
					src={link}
					width="100%"
					height="100%"
					type="text/html"
					allowFullScreen
					frameBorder="0"
				/>
			</div>
		</div>
	);
}

export type PostComponentProps = { post: Post, tag?: React.ReactElement, action?: FetchableAction, defaultCollapsed?: boolean };

export const PostComponent: React.FC<PostComponentProps> = props => {
	const { post, tag, action, defaultCollapsed = false, children } = props;
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
}

export const NoticeComponent: React.FC<Omit<PostComponentProps, 'post'> & { notice: Notice }> = props => {
	const { notice, ...postProps } = props;
	const classes = useStyles();

	return (
		<PostComponent
			post={notice}
			action={actions.notice(notice.courseId, notice.id)}
			tag={<PostTag className={classes.noticeTag} icon={<Announcement />} name="공지" />}
			{...postProps}
		/>
	);
}

export const AssignmentComponent: React.FC<Omit<PostComponentProps, 'post'> & { assignment: Assignment }> = props => {
	const { assignment, ...postProps } = props;
	const classes = useStyles();

	return (
		<PostComponent
			post={assignment}
			action={actions.assignment(assignment.courseId, assignment.id)}
			tag={<PostTag className={classes.assignmentTag} icon={<AssignmentLate />} name="과제" />}
			{...postProps}
		>
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
					disabled
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

export const LectureComponent: React.FC<Omit<PostComponentProps, 'post'> & { lecture: Lecture }> = props => {
	const { lecture, ...postProps } = props;
	const classes = useStyles();
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
		<PostComponent
			post={lecture}
			tag={<PostTag className={classes.lectureTag} icon={<OndemandVideo />} name="강의" />}
			{...postProps}
		>
			<VisibilitySensor onChange={isVisible => isVisible && setLazyLoad(true)}>
				<div>
					{lecture.link && linkType === 'html' &&
						<CardMedia>
							<ResponsiveIFrame link={lecture.link} />
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

export const ReferenceComponent: React.FC<Omit<PostComponentProps, 'post'> & { reference: Reference }> = props => {
	const { reference, ...postProps } = props;
	const classes = useStyles();

	return (
		<PostComponent
			post={reference}
			action={actions.reference(reference.courseId, reference.id)}
			tag={<PostTag className={classes.referenceTag} icon={<Description />} name="자료" />}
			{...postProps}
		/>
	);
}