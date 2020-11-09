import { Container, createStyles, CssBaseline, makeStyles, Typography } from '@material-ui/core';
import { Alert, Timeline, TimelineConnector, TimelineContent, TimelineDot, TimelineItem, TimelineOppositeContent, TimelineSeparator } from '@material-ui/lab';
import { AssignmentComponent, LectureComponent, NoticeComponent, PostComponent, ReferenceComponent } from 'components/PostComponent';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Post, sortPostByCreatedAtComparator } from 'service/door/interfaces';
import { Assignment } from 'service/door/interfaces/assignment';
import { RootState } from 'store/modules';
import { CourseState } from 'store/modules/courses';
import moment from 'moment';
import { DateTime } from 'components/DateTime';
import { Notice } from 'service/door/interfaces/notice';
import { Reference } from 'service/door/interfaces/reference';
import { Lecture } from 'service/door/interfaces/lecture';
import { CourseFetchIterator } from 'store/background';

const useStyles = makeStyles(theme => createStyles({
	paper: {
		flex: 1,
		paddingTop: theme.spacing(2)
	},
	container: {
		marginLeft: 'unset'
	},
	timelineOpposite: {
		display: 'none'
	}
}));

type PostType = 'notice' | 'lecture' | 'assignment' | 'reference';

const Fetcher: React.FC = props => {
	const dispatch = useDispatch();
	const [title, setTitle] = useState('');
	const [subtitle, setSubtitle] = useState('');

	useEffect(() => {
		const fetch = async () => {
			const iterator = new CourseFetchIterator();

			let next;
			do {
				next = iterator.next();

				if(next.value) {
					setTitle(next.value.title);
					setSubtitle(next.value.subtitle || '');
					await dispatch(next.value.action.fetchIfExpired());
				}
			} while(!next.done);

			setTitle('데이터가 현재 최신 상태입니다.');
			setSubtitle('');
		};

		// fetch();
	}, []);

	return (
		<Alert severity="info" variant="filled">{title} {subtitle}</Alert>
	);
}

export const TimelinePage: React.FC = () => {
	const classes = useStyles();
	const courses = useSelector<RootState, CourseState>(state => state.courses);

	let posts: { type: PostType, post: Post }[] = [];

	const pushToPost = (type: PostType, items: { [key: string]: Post }) => {
		Object.values(items).forEach(post => posts.push({ type, post }));
	};

	Object.values(courses.items).forEach(course => {
		pushToPost('notice', course.notices.items);
		Object.values(course.lectures.items).forEach(lecturesByWeek => pushToPost('lecture', lecturesByWeek.items));
		pushToPost('assignment', course.assignments.items);
		pushToPost('reference', course.references.items);
	});

	// Sort descend order
	posts = posts.sort((a, b) => sortPostByCreatedAtComparator(b.post, a.post));

	const postsByDay: { [key: string]: { type: PostType, post: Post }[] } = {
		[moment().format('YYYY-MM-DD')]: []
	};

	posts.forEach(postInfo => {
		const day = moment(postInfo.post.createdAt).startOf('days').format('YYYY-MM-DD');

		if(!postsByDay[day]) postsByDay[day] = [];

		postsByDay[day].push(postInfo);
	});

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
		}
	};

	return (
		<div className={classes.paper}>
			<CssBaseline />
			<Container className={classes.container}>
				<Fetcher />

				<Timeline>
					{Object.entries(postsByDay).map(([day, posts]) => (
						<TimelineItem key={day}>
							<TimelineOppositeContent className={classes.timelineOpposite} />

							<TimelineSeparator>
								<TimelineDot />
								<TimelineConnector />
							</TimelineSeparator>

							<TimelineContent>
								<Typography variant="h6"><DateTime relative date={day} precision="days" /></Typography>

								{posts.map(makePost)}
							</TimelineContent>
						</TimelineItem>
					))}
				</Timeline>
			</Container>
		</div>
	);
}