import {  Container, CssBaseline, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RouteComponentProps } from 'react-router';
import { RootState } from 'store';
import { CourseState, fetchAssignments, fetchCourse, fetchCourses, fetchLectures, fetchNotices } from 'store/modules/courses';

const useStyles = makeStyles(theme => ({
	paper: {
		width: '100%',
		display: 'flex',
		flexDirection: 'column',
		placeItems: 'center',
		placeContent: 'center'
	},
	fetchingCourse: {
		
	},
	fetching: {
		marginTop: theme.spacing(2)
	},
	progress: {
		width: '100%',
		marginTop: theme.spacing(3)
	}
}));

export const InitializePage: React.FC<RouteComponentProps> = props => {
	const { history } = props;
	const classes = useStyles();

	const courses = useSelector<RootState, CourseState>(state => state.courses);
	const [ fetchingCourse, setFetchingCourse ] = useState('');
	const [ fetching, setFetching ] = useState('');
	const dispatch = useDispatch();

	useEffect(() => {
		const fetch = async () => {
			if(!courses.fulfilled) {
				setFetching('강의 목록을 가져오는 중입니다');
				await dispatch(fetchCourses());
			}
		};

		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		const fetch = async () => {
			for(const course of Object.values(courses.items)) {
				setFetchingCourse(course.name);
				if(!course.fulfilled) {
					setFetching('강의 정보를 가져오는 중입니다');
					await dispatch(fetchCourse(course.id));
				}
				if(!course.notices?.fulfilled){
					setFetching('공지사항을 가져오는 중입니다');
					await dispatch(fetchNotices(course.id));
				}
				if(!course.lectures?.fulfilled){
					setFetching('강의 목록을 가져오는 중입니다');
					await dispatch(fetchLectures(course.id));
				}
				if(!course.assignments?.fulfilled){
					setFetching('과제 목록을 가져오는 중입니다');
					await dispatch(fetchAssignments(course.id));
				}
			}

			history.push('/main/dashboard');
		};

		courses.fulfilled && fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [courses.fulfilled]);

	return (
		<Container maxWidth="xs" className={classes.paper}>
			<CssBaseline />
			<Typography variant="h4" className={classes.fetchingCourse}>{fetchingCourse}</Typography>
			<Typography variant="h6" color="textSecondary" className={classes.fetching}>{fetching}</Typography>
			<LinearProgress className={classes.progress} />
		</Container>
	);
};