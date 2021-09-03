import { Course, Term } from 'door-api';
import { useHistory, useLocation, Redirect, Route, RouteComponentProps, Switch } from 'react-router';
import { useTerm } from '../hooks/door/useTerm';
import { DesktopNotFoundPage } from '../pages/DesktopNotFoundPage';
import React, { useEffect, useState } from 'react';
import { DesktopTermDashboard } from '../components/term/DesktopTermDashboard';
import { DesktopCoursePage } from './DesktopCoursePage';
import { Box, Container } from '@material-ui/core';
import { DesktopNavigator } from '../layout/DesktopNavigator';
import { DesktopSideBar } from '../layout/DesktopSideBar';
import { useCourse } from '../hooks/door/useCourse';
import { DesktopRequestTrigger } from '../components/common/DesktopRequestTrigger';
import { courseListURI } from '../../common/uri/uri';
import { DesktopDownloadList } from '../layout/DesktopDownloadList';

export type DesktopTermPageProps = RouteComponentProps<{
	termId: Term['id'];
}>;

export const DesktopTermPage: React.FC<DesktopTermPageProps> = props => {
	const {
		match: {
			url,
			path,
			params: { termId },
		},
	} = props;
	const { termById } = useTerm();
	const { fetchCourseList, courseById } = useCourse();
	const history = useHistory();
	const { pathname } = useLocation();

	const term = termById(termId);
	const [sideBarOpen, setSideBarOpen] = useState(false);
	const [selectedTerm, setSelectedTerm] = useState<Term | undefined>(undefined); // 사이드바에서 선택한 Term

	// 하위 URL에서 선택된 course id를 파싱하여 course를 가져옴 (SideBar를 위한 코드)
	const courseId = pathname.match(new RegExp(`${url}/course/(\\d+)`))?.[1];
	const selectedCourse = courseId === undefined ? undefined : courseById(courseId); // undefined는 선택된 Course가 없을 때(예: /dashboard)

	useEffect(() => setSideBarOpen(false), [pathname]); // restoration side bar when location changed

	// term not found!
	if (term === undefined) return <DesktopNotFoundPage>{`${termId}에 해당되는 학기 정보가 존재하지 않습니다.`}</DesktopNotFoundPage>;

	const handleSelectTerm = (term: Term) => {
		if (pathname === `${url}/dashboard`) {
			history.replace(path.replace(':termId', term.id));
		} else {
			fetchCourseList(term.id);
		}
		setSelectedTerm(term);
	};

	const handleSelectCourse = (course: Course) => {
		history.replace(`/term/${course.termId}/course/${course.id}`);
	};

	return (
		<Box flex={1} display="flex" flexDirection="column">
			<DesktopDownloadList />

			<DesktopRequestTrigger uri={courseListURI(term)} expireMinutes={120} onRequest={() => fetchCourseList(term.id)} />

			<DesktopNavigator
				onSideBarOpen={() => setSideBarOpen(true)}
				onClickHome={() => history.replace(`/term/${(selectedTerm ?? term).id}`)}
			/>

			<Box flex={1} display="flex" overflow="auto">
				<Container maxWidth="lg" style={{ flex: 1, display: 'flex', justifyContent: 'center', paddingTop: '1.5rem' }}>
					{term !== undefined && (
						<DesktopSideBar
							open={sideBarOpen}
							onClose={() => setSideBarOpen(false)}
							selectedTerm={selectedTerm ?? term}
							selectedCourse={selectedCourse}
							onSelectTerm={handleSelectTerm}
							onSelectCourse={handleSelectCourse}
						/>
					)}

					<Box component="section" flex={1} display="flex" flexDirection="column">
						<Switch>
							<Route path={`${path}/dashboard`} render={() => <DesktopTermDashboard term={term} />} />
							<Route path={`${path}/course/:courseId`} component={DesktopCoursePage} />

							<Redirect to={`${path}/dashboard`} />
						</Switch>
					</Box>
				</Container>
			</Box>
		</Box>
	);
};
