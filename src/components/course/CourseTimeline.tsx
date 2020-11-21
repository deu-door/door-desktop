import { createStyles, makeStyles, Typography } from '@material-ui/core';
import { Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@material-ui/lab';
import React from 'react';
import { Post, sortPostByCreatedAtComparator } from 'service/door/interfaces';
import { Assignment } from 'service/door/interfaces/assignment';
import moment from 'moment';
import { DateTime } from 'components/core/DateTime';
import { Notice } from 'service/door/interfaces/notice';
import { Reference } from 'service/door/interfaces/reference';
import { Lecture } from 'service/door/interfaces/lecture';
import { Course } from 'service/door/interfaces/course';
import { NoticeComponent } from '../post/NoticeComponent';
import { LectureComponent } from '../post/LectureComponent';
import { AssignmentComponent } from '../post/AssignmentComponent';
import { ReferenceComponent } from '../post/ReferenceComponent';
import { PostComponent } from '../post/PostComponent';
import { ActivityComponent } from 'components/post/ActivityComponent';
import { Activity } from 'service/door/interfaces/activity';
import { TeamProject } from 'service/door/interfaces/team-project';
import { TeamProjectComponent } from 'components/post/TeamProjectComponent';

const useStyles = makeStyles(theme => createStyles({
	timelineOpposite: {
		display: 'none'
	},
	timelineContent: {
		marginTop: theme.spacing(-1)
	}
}));

type PostType = 'notice' | 'lecture' | 'assignment' | 'reference' | 'activity' | 'teamProject';

export type CourseTimelinePostProps = { type: PostType, post: Post };

export const CourseTimelinePost: React.FC<CourseTimelinePostProps> = props => {
	const makePost = ({ type, post }: { type: PostType, post: Post }) => {
		switch(type){
			case 'notice':
				return (<NoticeComponent defaultCollapsed notice={post as Notice} />);
			case 'lecture':
				return (<LectureComponent defaultCollapsed lecture={post as Lecture} />);
			case 'assignment':
				return (<AssignmentComponent defaultCollapsed assignment={post as Assignment} />);
			case 'reference':
				return (<ReferenceComponent defaultCollapsed reference={post as Reference} />);
			case 'activity':
				return (<ActivityComponent defaultCollapsed activity={post as Activity} />);
			case 'teamProject':
				return (<TeamProjectComponent defaultCollapsed teamProject={post as TeamProject} />);
			default:
				return (<PostComponent defaultCollapsed post={post} />);
		}
	};

	return makePost(props);
}

export type CourseTimelineProps = { course: Course };

export const CourseTimeline: React.FC<CourseTimelineProps> = props => {
	const { course } = props;
	const classes = useStyles();

	const preventDuplicate = new Set();
	let posts: { type: PostType, post: Post }[] = [];

	const pushToPost = (type: PostType, items: { [key: string]: Post }) => {
		Object.values(items).forEach(post => {
			if(preventDuplicate.has(type + post.id)) return;

			posts.push({ type, post });

			preventDuplicate.add(type + post.id);
		});
	};

	pushToPost('notice', course.notices.items);
	Object.values(course.lectures.items).forEach(lecturesByWeek => pushToPost('lecture', lecturesByWeek.items));
	pushToPost('assignment', course.assignments.items);
	pushToPost('reference', course.references.items);
	pushToPost('activity', course.activities.items);
	pushToPost('teamProject', course.teamProjects.items);

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
							<CourseTimelinePost key={type + post.id} type={type} post={post} />
						))}
					</TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
}