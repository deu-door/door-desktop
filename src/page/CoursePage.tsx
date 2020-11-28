import { AppBar, Collapse, Container, createStyles, CssBaseline, Grid, IconButton, List, ListItem, ListItemText, makeStyles, Tab, Tabs, Typography } from '@material-ui/core';
import { BookmarksOutlined, ExpandLess, ExpandMore, FlagOutlined, PersonOutlined, ScheduleOutlined } from '@material-ui/icons';
import { ChatComponent } from 'components/chat/ChatComponent';
import { CourseRefresher } from 'components/course/CourseRefresher';
import { CourseTimeline } from 'components/course/CourseTimeline';
import { FetchableList } from 'components/fetchable/FetchableList';
import { FetchButton } from 'components/fetchable/FetchButton';
import { ActivityPost } from 'components/post/ActivityPost';
import { AssignmentPost } from 'components/post/AssignmentPost';
import { LecturePostList } from 'components/post/LecturePostList';
import { NoticePost } from 'components/post/NoticePost';
import { ReferencePost } from 'components/post/ReferencePost';
import { TeamProjectPost } from 'components/post/TeamProjectPost';
import React, { useState } from 'react';
import { sortPostByCreatedAt } from 'service/door/interfaces';
import { Course } from 'service/door/interfaces/course';
import { actions } from 'store/modules';

const useStyles = makeStyles(theme => createStyles({
	paper: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column'
	},
	courseSubtitle: {
		paddingTop: theme.spacing(1)
	},
	appBarContainer: {
		marginLeft: 'unset'
	},
	contentsContainer: {
		marginLeft: 'unset',
		marginTop: theme.spacing(2),
		flex: 1,
		display: 'flex',
		'& > *': {
			flex: 1
		}
	},
	courseHeaderFetchButton: {
		color: 'inherit'
	},
	tab: {
		minWidth: 110,
		width: 110
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

const CourseDetail: React.FC<{ name: string, fields: Array<{ name: string, text?: string|number }> }> = props => {
	const { name, fields } = props;

	return (
		<ListItem>
			<ListItemText>
				<Grid container direction="column">
					<Grid item>
						<Typography variant="subtitle1">{name}</Typography>
					</Grid>
					{fields.map(({ name, text }) => (
						<Grid item key={name}>
							<Typography variant="body2">{name}: {text}</Typography>
						</Grid>
					))}
				</Grid>
			</ListItemText>
		</ListItem>
	);
};

const CourseHeaderField: React.FC<{ icon: React.ReactElement, text: string }> = props => {
	const { icon, text } = props;

	return (
		<Grid container alignItems="center" spacing={1}>
			{icon}
			<Grid item>{text}</Grid>
		</Grid>
	)
};

const CourseHeader: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
	const [open, setOpen] = useState(false);

	const handleClick = () => setOpen(!open);

	return (
		<List>
			<ListItem>
				<ListItemText>
					<Typography variant="h4" component="h1">{course.name}</Typography>
					<Typography variant="subtitle1" className={classes.courseSubtitle}>
						<Grid container spacing={4}>
							<Grid item>
								<CourseHeaderField icon={<PersonOutlined fontSize="inherit" />} text={course.professor} />
							</Grid>
							<Grid item>
								<CourseHeaderField icon={<FlagOutlined fontSize="inherit" />} text={`${course.division}분반`} />
							</Grid>
							<Grid item>
								<CourseHeaderField icon={<BookmarksOutlined fontSize="inherit" />} text={`${course.credits}학점`} />
							</Grid>
							<Grid item>
								<CourseHeaderField icon={<ScheduleOutlined fontSize="inherit" />} text={`${course.hours}시간`} />
							</Grid>
						</Grid>
					</Typography>
				</ListItemText>
				<IconButton onClick={handleClick} color="inherit">
					{open ? <ExpandLess /> : <ExpandMore />}
				</IconButton>
			</ListItem>
			<Collapse in={open}>
				<CourseDetail
					name="강의 정보"
					fields={[
						{ name: '구분', text: course.type },
						{ name: '전공', text: course.major },
						{ name: '대상학년', text: course.target },
						{ name: '주교재', text: course.book }
					]}
				/>

				<CourseDetail
					name="교수 정보"
					fields={[
						{ name: '교수', text: course.professor },
						{ name: '연락처', text: course.contact },
						{ name: '이메일', text: course.email }
					]}
				/>

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

export const CoursePage: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();

	const tabs = [
		{ key: 'dashboard', label: '대시보드' },
		{ key: 'notices', label: '공지사항' },
		{ key: 'lectures', label: '온라인강의' },
		{ key: 'assignments', label: '과제' },
		{ key: 'references', label: '강의자료' },
		{ key: 'activities', label: '수업활동일지' },
		{ key: 'teamProjects', label: '팀 프로젝트' },
		{ key: 'chat', label: '채팅' }
	];

	const [ tab, setTab ] = useState(tabs[0].key);

	return (
		<div className={classes.paper}>
			<CssBaseline />
			<AppBar position="sticky" color="default">
				<Container className={classes.appBarContainer}>
					<CourseHeader course={course} />

					<Tabs value={tab} onChange={(event, newTab) => setTab(newTab)}>
						{tabs.map(({ key, label }) => (
							<Tab
								className={classes.tab}
								key={key}
								value={key}
								label={label}
							/>
						))}
					</Tabs>
				</Container>
			</AppBar>
			<Container className={classes.contentsContainer}>

				<TabPanel value={tab} index="dashboard">
					<CourseRefresher course={course} />

					<CourseTimeline course={course} />
				</TabPanel>

				<TabPanel value={tab} index="notices">
					<FetchableList fetchableMap={course.notices} action={actions.notices(course.id)}>
						{sortPostByCreatedAt(course.notices).reverse().map(notice => (
							<NoticePost key={notice.id} post={notice} />
						))}
					</FetchableList>
				</TabPanel>

				<TabPanel value={tab} index="lectures">
					<LecturePostList course={course} />
				</TabPanel>

				<TabPanel value={tab} index="assignments">
					<FetchableList fetchableMap={course.assignments} action={actions.assignments(course.id)}>
						{sortPostByCreatedAt(course.assignments).reverse().map(assignment => (
							<AssignmentPost key={assignment.id} post={assignment} />
						))}
					</FetchableList>
				</TabPanel>

				<TabPanel value={tab} index="references">
					<FetchableList fetchableMap={course.references} action={actions.references(course.id)}>
						{sortPostByCreatedAt(course.references).reverse().map(reference => (
							<ReferencePost key={reference.id} post={reference} />
						))}
					</FetchableList>
				</TabPanel>

				<TabPanel value={tab} index="activities">
					<FetchableList fetchableMap={course.activities} action={actions.activities(course.id)}>
						{sortPostByCreatedAt(course.activities).reverse().map(activity => (
							<ActivityPost key={activity.id} post={activity} />
						))}
					</FetchableList>
				</TabPanel>

				<TabPanel value={tab} index="teamProjects">
					<FetchableList fetchableMap={course.teamProjects} action={actions.teamProjects(course.id)}>
						{sortPostByCreatedAt(course.teamProjects).reverse().map(teamProject => (
							<TeamProjectPost key={teamProject.id} post={teamProject} />
						))}
					</FetchableList>
				</TabPanel>

				<TabPanel value={tab} index="chat">
					<ChatComponent course={course} />
				</TabPanel>

				<TabPanel value={tab} index="info">
					{/* <CourseInformation course={course} /> */}
				</TabPanel>
			</Container>
		</div>
	);
};
