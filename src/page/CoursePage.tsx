import { AppBar, CardMedia, Collapse, Container, createStyles, CssBaseline, IconButton, List, ListItem, ListItemText, makeStyles, Step, StepButton, StepContent, Stepper, Tab, Tabs, Typography } from '@material-ui/core';
import { ExpandLess, ExpandMore } from '@material-ui/icons';
import { FetchableList } from 'components/FetchableList';
import { FetchButton } from 'components/FetchButton';
import { AssignmentComponent, LectureComponent, NoticeComponent, PostComponent } from 'components/PostComponent';
import React, { useState } from 'react';
import { Assignment } from 'service/door/interfaces/assignment';
import { Course } from 'service/door/interfaces/course';
import { Lecture } from 'service/door/interfaces/lecture';
import { Notice } from 'service/door/interfaces/notice';
import { actions } from 'store/modules';

const useStyles = makeStyles(theme => createStyles({
	paper: {
		flex: 1
	},
	container: {
		marginLeft: 'unset'
	},
	courseHeaderFetchButton: {
		color: 'inherit'
	},
	fetchButton: {
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

const CourseInformation: React.FC<{ name: string, description: string }> = props => {
	const { name, description } = props;

	return (
		<ListItem>
			<ListItemText>
				<Typography variant="subtitle1">{name}</Typography>
				<Typography variant="body2">{description}</Typography>
			</ListItemText>
		</ListItem>
	);
}

export const CourseHeader: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
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
				{[
					{ name: '개요', description: course.description },
					{ name: '목표', description: course.goal }
				].map(information => (
					information.description &&
						<CourseInformation
							key={information.name}
							name={information.name}
							description={information.description}
						/>
				))}

				<ListItem>
					<FetchButton
						fetchable={course}
						action={actions.course(course.id)}
						className={classes.courseHeaderFetchButton}
					/>
				</ListItem>
			</Collapse>
		</List>
	);
};

export const LectureList: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
	const [ activeWeek, setActiveWeek ] = useState(Object.values(course.lectures.items).length - 1);

	return (
		<FetchableList fetchableMap={course.lectures} action={actions.lectures(course.id)}>
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
								<LectureComponent key={lecture.id} lecture={lecture} />
							))}
							<FetchButton fetchable={week} action={actions.lectureByWeek(course.id, week.id)} />
						</StepContent>
					</Step>
				))}
			</Stepper>
		</FetchableList>
	);
}

export const CoursePage: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
	const [ tab, setTab ] = useState('notices');

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
					<CourseHeader course={course} />

					<Tabs value={tab} onChange={(event, newTab) => setTab(newTab)}>
						{tabs.map(({ key, label }) => (
							<Tab key={key} value={key} label={label} />
						))}
					</Tabs>
				</Container>
			</AppBar>
			<Container className={classes.container}>

				<TabPanel value={tab} index="notices">
					<FetchableList fetchableMap={course.notices} action={actions.notices(course.id)}>
						{Object.values(course.notices.items).map(notice => (
							<NoticeComponent key={notice.id} notice={notice} />
						))}
					</FetchableList>
				</TabPanel>

				<TabPanel value={tab} index="lectures">
					<LectureList course={course} />
				</TabPanel>

				<TabPanel value={tab} index="assignments">
					<FetchableList fetchableMap={course.assignments} action={actions.assignments(course.id)}>
						{Object.values(course.assignments.items).reverse().map(assignment => (
							<AssignmentComponent key={assignment.id} assignment={assignment} />
						))}
					</FetchableList>
				</TabPanel>

			</Container>
		</div>
	);
};
