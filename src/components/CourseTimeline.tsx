import { Container, createStyles, CssBaseline, makeStyles, Typography } from '@material-ui/core';
import { Alert, Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@material-ui/lab';
import { AssignmentComponent, LectureComponent, NoticeComponent, PostComponent, ReferenceComponent } from 'components/PostComponent';
import React from 'react';
import { Post, sortPostByCreatedAtComparator } from 'service/door/interfaces';
import { Assignment } from 'service/door/interfaces/assignment';
import moment from 'moment';
import { DateTime } from 'components/DateTime';
import { Notice } from 'service/door/interfaces/notice';
import { Reference } from 'service/door/interfaces/reference';
import { Lecture } from 'service/door/interfaces/lecture';
import { Course } from 'service/door/interfaces/course';

const useStyles = makeStyles(theme => createStyles({
	timelineOpposite: {
		display: 'none'
	},
	timelineContent: {
		marginTop: theme.spacing(-1)
	}
}));

type PostType = 'notice' | 'lecture' | 'assignment' | 'reference';

export type CourseTimelinePostProps = { type: PostType, post: Post };

export const CourseTimelinePost: React.FC<CourseTimelinePostProps> = props => {
	const makePost = ({ type, post }: { type: PostType, post: Post }) => {
		switch(type){
			case 'notice':
				return (<NoticeComponent defaultCollapsed key={'notice-' + post.id} notice={post as Notice} />);
			case 'lecture':
				return (<LectureComponent defaultCollapsed key={'lecture-' + post.id} lecture={post as Lecture} />);
			case 'assignment':
				return (<AssignmentComponent defaultCollapsed key={'assignment-' + post.id} assignment={post as Assignment} />);
			case 'reference':
				return (<ReferenceComponent defaultCollapsed key={'reference-' + post.id} reference={post as Reference} />);
			default:
				return (<PostComponent defaultCollapsed key={'post' + post.id} post={post} />);
		}
	};

	return makePost(props);
}

export type CourseTimelineProps = { course: Course };

export const CourseTimeline: React.FC<CourseTimelineProps> = props => {
	const { course } = props;
	const classes = useStyles();

	let posts: { type: PostType, post: Post }[] = [];

	const pushToPost = (type: PostType, items: { [key: string]: Post }) => {
		Object.values(items).forEach(post => posts.push({ type, post }));
	};

	pushToPost('notice', course.notices.items);
	Object.values(course.lectures.items).forEach(lecturesByWeek => pushToPost('lecture', lecturesByWeek.items));
	pushToPost('assignment', course.assignments.items);
	pushToPost('reference', course.references.items);

	// Sort descend order
	posts = posts.sort((a, b) => sortPostByCreatedAtComparator(b.post, a.post));

	const postsByDay: { [key: string]: { type: PostType, post: Post }[] } = {
		// Contains TODAY
		[moment().format('YYYY-MM-DD')]: []
	};

	posts.forEach(postInfo => {
		const day = moment(postInfo.post.createdAt).startOf('days').format('YYYY-MM-DD');

		if(!postsByDay[day]) postsByDay[day] = [];

		postsByDay[day].push(postInfo);
	});

	return (
		<Timeline>
			{Object.entries(postsByDay).map(([day, posts]) => (
				<TimelineItem key={day}>
					<TimelineOppositeContent className={classes.timelineOpposite} />

					<TimelineSeparator>
						<TimelineDot />
						<TimelineConnector />
					</TimelineSeparator>

					<TimelineContent className={classes.timelineContent}>
						<Typography variant="h6"><DateTime relative date={day} precision="days" /></Typography>

						{posts.map(({ type, post }) => (
							<CourseTimelinePost type={type} post={post} />
						))}
					</TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
}