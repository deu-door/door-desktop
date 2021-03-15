import { Box, Container } from '@material-ui/core';
import { CourseInfo } from 'components/course/CourseInfo';
import { LectureList } from 'components/lecture/LectureList';
import { useCourses } from 'hooks/door/useCourses';
import { ICourse } from 'models/door';
import React, { useEffect, useState } from 'react';
import { useRouteMatch } from 'react-router';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { PostDetails } from '../post/PostDetails';
import { PostList } from '../post/PostList';
import { Navigator } from 'components/layout/Navigator';
import { CourseHead } from 'components/course/CourseHead';
import { ResponsiveSideBar } from 'components/layout/ResponsiveSideBar';

export type CoursePageProps = RouteComponentProps<{
	courseId: ICourse['id'];
}>;

export const CoursePage: React.FC<CoursePageProps> = props => {
	const {
		match: {
			params: { courseId: id },
		},
	} = props;
	const { path } = useRouteMatch();
	const { courseById } = useCourses();
	const course = courseById(id);

	const [mobileOpen, setMobileOpen] = useState(false);

	// close drawer when navigate to another course
	useEffect(() => setMobileOpen(false), [id]);

	return (
		<Box flex="1" display="flex" flexDirection="column">
			<Navigator onSideBarOpen={() => setMobileOpen(true)} />

			<Box height="1.5rem" flexShrink={0} />

			<Box flex="1" display="flex" justifyContent="center" overflow="auto">
				<Container maxWidth="lg" style={{ height: '100%', display: 'flex' }}>
					<ResponsiveSideBar open={mobileOpen} onClose={() => setMobileOpen(!mobileOpen)} selected={course} />

					<Box component="section" flex={1} display="flex" flexDirection="column">
						{course === undefined ? (
							<Box flex={1} alignItems="center">
								왼쪽 메뉴에서 강의를 선택하세요!
							</Box>
						) : (
							<>
								<CourseHead course={course} />

								<Box flex={1} overflow="auto">
									<Switch>
										<Route exact path={`${path}/lectures`} component={LectureList} />
										<Route exact path={`${path}/details`} component={CourseInfo} />
										<Route path={`${path}/:postVariant/:postId`} component={PostDetails} />
										<Route path={`${path}/:postVariant`} component={PostList} />

										<Redirect to={`${path}/lectures`} />
									</Switch>
								</Box>
							</>
						)}
					</Box>
				</Container>
			</Box>
		</Box>
	);
};
