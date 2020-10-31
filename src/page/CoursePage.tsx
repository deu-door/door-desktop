import { AppBar, Button, Card, CardActions, CardContent, CardHeader, Collapse, Container, createStyles, CssBaseline, IconButton, List, ListItem, ListItemText, makeStyles, Step, StepButton, StepContent, Stepper, Tab, Tabs, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import React, { useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { Fetchable, Post } from 'service/door/interfaces';
import { Course } from 'service/door/interfaces/course';
import { RootState } from 'store';
import { CourseState, fetchAssignment, fetchLectureByWeek, fetchNotice } from 'store/modules/courses';

const useStyles = makeStyles(theme => createStyles({
	paper: {
		flex: 1
	},
	container: {
		marginLeft: 'unset'
	},
	post: {
		margin: theme.spacing(2, 0)
	},
	lecturesByWeek: {
		flexDirection: 'column-reverse'
	}
}));

const TabPanel: React.FC<{ value: string|number, index: string|number, children?: React.ReactNode }> = props => {
	const { value, index, children } = props;

	return (
		<div hidden={value !== index}>
			{children}
		</div>
	)
}

export const CourseDescription: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const [open, setOpen] = useState(false);

	const handleClick = () => setOpen(!open);

	return (
		<List>
			<ListItem>
				<ListItemText>
					<Typography variant="h4" component="h1">{course.name}</Typography>
					<Typography variant="subtitle1">{course.professor}</Typography>
				</ListItemText>
				<IconButton onClick={handleClick} color="inherit">
					{open ? <ExpandLess /> : <ExpandMore />}
				</IconButton>
			</ListItem>
			<Collapse in={open}>
				<ListItem>
					<ListItemText>
						<Typography variant="subtitle1">개요</Typography>
						<Typography variant="body2">{course.description}</Typography>
					</ListItemText>
				</ListItem>
				<ListItem>
					<ListItemText>
						<Typography variant="subtitle1">목표</Typography>
						<Typography variant="body2">{course.goal}</Typography>
					</ListItemText>
				</ListItem>
			</Collapse>
		</List>
	);
};

export const FetchableControl: React.FC<{ fetchable: Fetchable, fetcher?: Function }> = props => {
	const { fetchable, fetcher } = props;
	const dispatch = useDispatch();

	return (
		<Button size="small" color="primary" disabled={fetchable.pending} onClick={() => fetcher && dispatch(fetcher())}>
			{fetchable.fulfilled ? "새로고침" : "불러오기"}
		</Button>
	)
}

export const PostComponent: React.FC<{ post: Post, fetcher?: Function }> = props => {
	const { post, fetcher } = props;
	const classes = useStyles();

	return (
		<Card className={classes.post}>
			<CardHeader
				title={post.title}
				subheader={post.author}
			/>
			{post.contents && <CardContent >
				<Typography variant="body2" color="textSecondary" component="span" paragraph>
					<div dangerouslySetInnerHTML={{ __html: post.contents }}></div>
				</Typography>
			</CardContent>}
			{fetcher && <CardActions>
				<FetchableControl fetchable={post} fetcher={fetcher} />
			</CardActions>}
		</Card>
	);
};

export const CourseComponent: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
	const [ tab, setTab ] = useState('notices');
	const [ activeWeek, setActiveWeek ] = useState(Object.values(course.lectures.items).length - 1);

	const tabs = [
		{ key: 'notices', label: '공지사항' },
		{ key: 'lectures', label: '온라인강의' },
		{ key: 'assignments', label: '과제' }
	];

	return (
		<div className={classes.paper}>
			<CssBaseline />
			<AppBar position="sticky">
				<Container className={classes.container}>
					<CourseDescription course={course} />

					<Tabs value={tab} onChange={(event, newTab) => setTab(newTab)}>
						{tabs.map(({ key, label }) => (
							<Tab key={key} value={key} label={label} />
						))}
					</Tabs>
				</Container>
			</AppBar>
			<Container className={classes.container}>
				<TabPanel value={tab} index="notices">
					{Object.values(course.notices.items).reverse().map(notice => (
						<PostComponent key={notice.id} post={notice} fetcher={() => fetchNotice(course.id, notice.id)}/>
					))}
				</TabPanel>
				<TabPanel value={tab} index="lectures">
					<Stepper orientation="vertical" activeStep={activeWeek} nonLinear className={classes.lecturesByWeek}>
						{Object.values(course.lectures.items).map((week, index) => (
							<Step key={week.id}>
								<StepButton
									onClick={() => setActiveWeek(index)}
									completed={false}
								>
									{`${week.id}주차`}
								</StepButton>
								<StepContent>
									{Object.values(week.items).map(lecture => (
										<PostComponent key={lecture.id} post={lecture} />
									))}
									<FetchableControl fetchable={week} fetcher={() => fetchLectureByWeek(course.id, week.id)} />
								</StepContent>
							</Step>
						))}
					</Stepper>
				</TabPanel>
				<TabPanel value={tab} index="assignments">
					{Object.values(course.assignments.items).reverse().map(assignment => (
						<PostComponent key={assignment.id} post={assignment} fetcher={() => fetchAssignment(course.id, assignment.id)} />
					))}
				</TabPanel>
			</Container>
		</div>
	);
};

export const CoursePage: React.FC<RouteComponentProps> = props => {
	const { match } = props;
	
	const courses = useSelector<RootState, CourseState>(state => state.courses);

	const course = courses.items[(match.params as any).courseId];

	return (
		<CourseComponent course={course} />
	);
}