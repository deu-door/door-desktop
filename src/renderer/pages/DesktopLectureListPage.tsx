import { RouteComponentProps } from 'react-router';
import React from 'react';
import { Course } from 'door-api';
import { useCourse } from '../hooks/door/useCourse';
import { DesktopNotFoundPage } from './DesktopNotFoundPage';
import { DesktopLectureList } from '../components/lecture/DesktopLectureList';

export type DesktopLectureListPageProps = RouteComponentProps<{
	courseId: Course['id'];
}>;

export const DesktopLectureListPage: React.FC<DesktopLectureListPageProps> = props => {
	const {
		match: {
			params: { courseId },
		},
	} = props;
	const { courseById } = useCourse();
	const course = courseById(courseId);

	if (course === undefined) return <DesktopNotFoundPage {...props} />;

	return <DesktopLectureList course={course} />;
};
