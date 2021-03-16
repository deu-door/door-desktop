import { Box, Container } from '@material-ui/core';
import { CourseInfo, RouteCourseInfo } from 'components/course/CourseInfo';
import { LectureList, RouteLectureList } from 'components/lecture/LectureList';
import { useCourses } from 'hooks/door/useCourses';
import { ICourse, ITerm } from 'models/door';
import React, { useEffect, useState } from 'react';
import { useHistory, useRouteMatch } from 'react-router';
import { Redirect, Route, RouteComponentProps, Switch } from 'react-router-dom';
import { RoutePostDetails } from '../post/PostDetails';
import { RoutePostList } from '../post/PostList';
import { Navigator } from 'components/layout/Navigator';
import { CourseHead } from 'components/course/CourseHead';
import { ResponsiveSideBar } from 'components/layout/ResponsiveSideBar';
import { RouteTermDashboard } from 'components/term/TermDashboard';
import { useTerms } from 'hooks/door/useTerms';
import { KeepLatestState } from 'components/common/KeepLatestState';

export type CoursePageProps = RouteComponentProps<{
	termId?: ITerm['id'];
	courseId?: ICourse['id'];
}>;

export const CoursePage: React.FC<CoursePageProps> = props => {
	const {
		match: {
			params: { termId, courseId },
		},
	} = props;
	const { path } = useRouteMatch();
	const history = useHistory();
	const { courseById, fetchCourses } = useCourses();
	const { terms: termsState, termById, allTerms, fetchTerms } = useTerms();
	const terms = allTerms();

	const [mobileOpen, setMobileOpen] = useState(false);

	// close drawer when navigate to another course
	useEffect(() => setMobileOpen(false), [courseId]);

	// Route: /courses/:courseId
	const course = courseId !== undefined ? courseById(courseId) : undefined;

	// 1. pick term from parsed url params
	// 2. else, pick from side bar
	const [selectedTermId, setSelectedTermId] = useState(
		(course !== undefined && termId !== undefined ? termId : undefined) ?? allTerms()[0]?.id,
	);

	// Route: /terms/:termId
	const term = (termId !== undefined ? termById(termId) : undefined) ?? termById(selectedTermId);

	return (
		<Box flex={1} display="flex" flexDirection="column">
			<KeepLatestState state={termsState} expirationInterval={1 * 60 * 60 * 1000} onTriggerFetch={fetchTerms}>
				<KeepLatestState state={term} expirationInterval={1 * 60 * 60 * 1000} onTriggerFetch={() => term && fetchCourses(term)}>
					<Navigator
						onSideBarOpen={() => setMobileOpen(true)}
						onClickHome={() => history.replace(term === undefined ? '/terms' : `/terms/${term.id}`)}
					/>
				</KeepLatestState>
			</KeepLatestState>

			<Box height="1.5rem" flexShrink={0} />

			<Box flex="1" display="flex" justifyContent="center" overflow="auto">
				<Container maxWidth="lg" style={{ height: '100%', display: 'flex' }}>
					{term !== undefined && (
						<ResponsiveSideBar
							open={mobileOpen}
							onClose={() => setMobileOpen(!mobileOpen)}
							selectedTerm={term}
							selectedCourse={course}
							onSelectTerm={term => {
								if (course !== undefined) {
									setSelectedTermId(term.id);
								}
								// Route: /terms/:termId
								// navigate term dashboard page if current route is not /courses/:courseId
								else {
									history.replace(`/terms/${term.id}`);
								}
							}}
							onSelectCourse={course => {
								// Route: /courses/:courseId
								history.replace(`/courses/${course.id}`);
							}}
						/>
					)}

					<Box component="section" flex={1} display="flex" flexDirection="column">
						{course === undefined ? (
							terms.length > 0 && (
								<Box flex={1} overflow="hidden auto">
									<Switch>
										<Route path={`/terms/:termId`} component={RouteTermDashboard} />

										<Redirect to={`/terms/${terms[0].id}`} />
									</Switch>
								</Box>
							)
						) : (
							<>
								<CourseHead course={course} />

								<Box flex={1} overflow="auto">
									<Switch>
										<Route exact path={`${path}/lectures`} component={RouteLectureList} />
										<Route exact path={`${path}/details`} component={RouteCourseInfo} />
										<Route path={`${path}/:postVariant/:postId`} component={RoutePostDetails} />
										<Route path={`${path}/:postVariant`} component={RoutePostList} />

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
