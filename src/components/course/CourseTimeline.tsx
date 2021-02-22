import { createStyles, makeStyles, Typography } from '@material-ui/core';
import {
	Timeline,
	TimelineConnector,
	TimelineContent,
	TimelineDot,
	TimelineItem,
	TimelineOppositeContent,
	TimelineSeparator,
} from '@material-ui/lab';
import React from 'react';
import { Post, sortPostByCreatedAtComparator } from 'service/door/interfaces';
import moment from 'moment';
import { DateTime } from 'components/core/DateTime';
import { Course } from 'service/door/interfaces/course';
import { NoticePost } from 'components/post/NoticePost';
import { AssignmentPost } from 'components/post/AssignmentPost';
import { ReferencePost } from 'components/post/ReferencePost';
import { ActivityPost } from 'components/post/ActivityPost';
import { TeamProjectPost } from 'components/post/TeamProjectPost';
import { LecturePost } from 'components/post/LecturePost';

const useStyles = makeStyles(theme =>
	createStyles({
		timelineOpposite: {
			display: 'none',
		},
		timelineContent: {
			marginTop: theme.spacing(-1),
		},
	}),
);

export type CourseTimelineProps = { course: Course };

export const CourseTimeline: React.FC<CourseTimelineProps> = props => {
	const { course } = props;
	const classes = useStyles();

	const ids = new Set();

	type PostItem = {
		post: Post;
		key: string;
		render: () => React.ReactElement;
	};

	const posts: Array<PostItem> = [
		...Object.values(course.notices.items).map(notice => ({
			post: notice,
			key: `notice-${notice.id}`,
			render: () => (
				<NoticePost
					key={`notice-${notice.id}`}
					post={notice}
					defaultCollapsed
				/>
			),
		})),
		...Object.values(course.lectures.items)
			.map(lecturesByWeek => Object.values(lecturesByWeek.items))
			.flat()
			.map(lecture => ({
				post: lecture,
				key: `lecture-${lecture.id}`,
				render: () => (
					<LecturePost
						key={`lecture-${lecture.id}`}
						post={lecture}
						defaultCollapsed
					/>
				),
			})),
		...Object.values(course.assignments.items).map(assignment => ({
			post: assignment,
			key: `assignment-${assignment.id}`,
			render: () => (
				<AssignmentPost
					key={`assignment-${assignment.id}`}
					post={assignment}
					defaultCollapsed
				/>
			),
		})),
		...Object.values(course.references.items).map(reference => ({
			post: reference,
			key: `reference-${reference.id}`,
			render: () => (
				<ReferencePost
					key={`reference-${reference.id}`}
					post={reference}
					defaultCollapsed
				/>
			),
		})),
		...Object.values(course.activities.items).map(activity => ({
			post: activity,
			key: `activity-${activity.id}`,
			render: () => (
				<ActivityPost
					key={`activity-${activity.id}`}
					post={activity}
					defaultCollapsed
				/>
			),
		})),
		...Object.values(course.teamProjects.items).map(teamProject => ({
			post: teamProject,
			key: `teamProject-${teamProject.id}`,
			render: () => (
				<TeamProjectPost
					key={`teamProject-${teamProject.id}`}
					post={teamProject}
					defaultCollapsed
				/>
			),
		})),
	]
		.filter(({ key }) => {
			if (ids.has(key)) return false;

			ids.add(key);
			return true;
		})
		.sort(({ post: postA }, { post: postB }) => {
			// Sort descend order
			return sortPostByCreatedAtComparator(postB, postA);
		});

	const postsByDay: Record<string, PostItem[]> = {
		// Contains TODAY
		[moment().format('YYYY-MM-DD')]: [],
	};

	posts.forEach(postItem => {
		const day = moment(postItem.post.createdAt)
			.startOf('days')
			.format('YYYY-MM-DD');

		if (!postsByDay[day]) postsByDay[day] = [];

		postsByDay[day].push(postItem);
	});

	return (
		<Timeline>
			{Object.entries(postsByDay).map(([day, posts]) => (
				<TimelineItem key={day}>
					<TimelineOppositeContent
						className={classes.timelineOpposite}
					/>

					<TimelineSeparator>
						<TimelineDot />
						<TimelineConnector />
					</TimelineSeparator>

					<TimelineContent className={classes.timelineContent}>
						<Typography variant="h6">
							<DateTime relative date={day} precision="days" />
						</Typography>

						{posts.map(({ render }) => render())}
					</TimelineContent>
				</TimelineItem>
			))}
		</Timeline>
	);
};
