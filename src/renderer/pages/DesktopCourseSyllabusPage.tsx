import { RouteComponentProps } from 'react-router';
import React from 'react';
import { Course } from 'door-api';
import { useCourse } from '../hooks/door/useCourse';
import { DesktopNotFoundPage } from './DesktopNotFoundPage';
import { DesktopCourseSyllabus } from '../components/course/DesktopCourseSyllabus';

export type DesktopCourseSyllabusPageProps = RouteComponentProps<{
	courseId: Course['id'];
}>;

export const DesktopCourseSyllabusPage: React.FC<DesktopCourseSyllabusPageProps> = props => {
	const {
		match: {
			params: { courseId },
		},
	} = props;
	const { courseById } = useCourse();
	const course = courseById(courseId);

	if (course === undefined) return <DesktopNotFoundPage>{`${courseId}에 해당되는 강의가 존재하지 않습니다.`}</DesktopNotFoundPage>;

	return (
		<>
			<DesktopCourseSyllabus course={course} />
		</>
	);
};
