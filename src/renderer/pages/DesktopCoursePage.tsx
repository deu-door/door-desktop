import { Box } from '@material-ui/core';
import React from 'react';
import { Redirect, Route, RouteComponentProps, Switch, useHistory, useLocation } from 'react-router';
import { DesktopCourseMenuNavigator } from '../components/course/DesktopCourseHead';
import {
	Course,
	PostVariantNames,
	AssignmentVariantNames,
	PostVariant,
	AssignmentVariant,
	AssignmentVariants,
	PostVariants,
} from 'door-api';
import { useCourse } from '../hooks/door/useCourse';
import { DesktopNotFoundPage } from './DesktopNotFoundPage';
import { DesktopLectureListPage } from './DesktopLectureListPage';
import { DesktopPostListPage } from './DesktopPostListPage';
import { DesktopPostDetailPage } from './DesktopPostDetailPage';
import { DesktopCourseSyllabusPage } from './DesktopCourseSyllabusPage';
import { DesktopRequestTrigger } from '../components/common/DesktopRequestTrigger';
import { courseSyllabusURI } from '../../common/uri/uri';
import { DesktopAssignmentListPage } from './DesktopAssignmentListPage';
import { DesktopAssignmentDetailPage } from './DesktopAssignmentDetailPage';

type DesktopPostOrAssignmentPageProps = RouteComponentProps<{
	variant: PostVariant | AssignmentVariant;
}>;

const DesktopPostOrAssignmentPage: React.FC<DesktopPostOrAssignmentPageProps> = props => {
	const {
		match: {
			path,
			params: { variant },
		},
	} = props;

	if (PostVariants.some(_variant => _variant === variant)) {
		return (
			<>
				<Route exact path={path} component={DesktopPostListPage} />
				<Route path={`${path}/:postId`} component={DesktopPostDetailPage} />
			</>
		);
	} else if (AssignmentVariants.some(_variant => _variant === variant)) {
		return (
			<>
				<Route exact path={path} component={DesktopAssignmentListPage} />
				<Route path={`${path}/:assignmentId`} component={DesktopAssignmentDetailPage} />
			</>
		);
	} else {
		return <DesktopNotFoundPage>{`${variant} 은(는) 존재하지 않는 게시물 타입입니다.`}</DesktopNotFoundPage>;
	}
};

export type DesktopCoursePageProps = RouteComponentProps<{
	courseId: Course['id'];
}>;

export const DesktopCoursePage: React.FC<DesktopCoursePageProps> = props => {
	const {
		match: {
			url,
			path,
			params: { courseId },
		},
	} = props;
	const { courseById, fetchCourseSyllabus } = useCourse();
	const course = courseById(courseId);
	const history = useHistory();
	const { pathname } = useLocation();

	if (course === undefined) return <DesktopNotFoundPage {...props} />;

	const menuList = [
		{
			label: '온라인강의',
			value: `${url}/lecture`,
			group: 'lecture',
		},
		{
			label: '정보',
			value: `${url}/syllabus`,
			group: 'syllabus',
		},
		...Object.entries(PostVariantNames).map(([variant, name]) => ({
			label: name,
			value: `${url}/${variant}`,
			group: 'post',
		})),
		...Object.entries(AssignmentVariantNames).map(([variant, name]) => ({
			label: name,
			value: `${url}/${variant}`,
			group: 'assignment',
		})),
	];

	const selectedMenu = menuList.find(menu => pathname.startsWith(menu.value))?.value;

	const handleSelectMenu = (url: string) => {
		history.replace(url);
	};

	return (
		<>
			<DesktopRequestTrigger uri={courseSyllabusURI(course)} expireMinutes={360} onRequest={() => fetchCourseSyllabus(course.id)} />

			<DesktopCourseMenuNavigator
				course={course}
				menuList={menuList}
				value={selectedMenu}
				onChange={({ value }) => handleSelectMenu(value)}
			/>

			<Box flex={1} overflow="auto">
				<Switch>
					<Route exact path={`${path}/lecture`} component={DesktopLectureListPage} />
					<Route exact path={`${path}/syllabus`} component={DesktopCourseSyllabusPage} />
					<Route path={`${path}/:variant`} component={DesktopPostOrAssignmentPage} />

					<Redirect to={`${path}/lecture`} />
				</Switch>
			</Box>
		</>
	);
};
