import { Box, CircularProgress, Grid, Hidden, Typography } from '@material-ui/core';
import { DesktopBanner } from '../common/DesktopBanner';
import React, { useEffect, useState } from 'react';
import { DesktopTimeTable } from '../common/DesktopTimeTable';
import { AssignmentVariantNames, Course, PostVariantNames, Term } from 'door-api';
import { useCourse } from '../../hooks/door/useCourse';
import { useAssignment } from '../../hooks/door/useAssignment';
import { usePost } from '../../hooks/door/usePost';
import { DesktopSpacer } from '../common/DesktopSpacer';
import { DesktopContentList } from '../content/DesktopContentList';
import { DesktopTermContentUpdater } from './DesktopTermContentUpdater';
import { DesktopLectureDashboard } from '../lecture/DesktopLectureDashboard';

export type DesktopTermDashboardProps = {
	term: Term;
};

export const DesktopTermDashboard: React.FC<DesktopTermDashboardProps> = props => {
	const { term } = props;
	const { courseListByTerm, fetchCourseSyllabus } = useCourse();
	const courseList = courseListByTerm(term.id);
	const [selectedCourse, setSelectedCourse] = useState<Course | undefined>(undefined);

	const courseShouldFetchSyllabus = courseList.find(course => course.syllabus === undefined);

	useEffect(() => {
		// fetch course's syllabus
		courseShouldFetchSyllabus !== undefined && fetchCourseSyllabus(courseShouldFetchSyllabus.id);
	}, [courseShouldFetchSyllabus]);

	const courseIds = new Set(selectedCourse !== undefined ? [selectedCourse.id] : courseList.map(course => course.id));
	const { postList: _postList } = usePost();
	const { assignmentList: _assignmentList } = useAssignment();

	const postList = _postList.filter(post => courseIds.has(post.courseId));
	const assignmentList = _assignmentList.filter(assignment => courseIds.has(assignment.courseId));

	return courseShouldFetchSyllabus !== undefined ? (
		<Box flex={1} display="flex" flexDirection="column" alignItems="center" justifyContent="center">
			<CircularProgress size={80} />
			<DesktopSpacer vertical={8} />
			<Typography variant="h6" color="textSecondary">
				{courseShouldFetchSyllabus.name} 강의계획서 불러오는 중 ...
			</Typography>
		</Box>
	) : (
		<Box flex={1}>
			<Box>
				<Typography variant="subtitle1" color="textSecondary">
					Door Desktop
				</Typography>
				<Typography variant="h5">{term.name}</Typography>
			</Box>

			<DesktopSpacer vertical={4} />

			<DesktopTermContentUpdater term={term} />

			<DesktopSpacer vertical={4} />

			<Grid container spacing={2} direction="row-reverse">
				<Grid item xs={12} md={6}>
					<Box>
						<DesktopTimeTable courseList={courseList} selected={selectedCourse} onSelect={setSelectedCourse} />
					</Box>
				</Grid>

				<Hidden mdUp>
					<Grid item xs={12}>
						<DesktopSpacer vertical={4} />
					</Grid>
				</Hidden>

				<Grid item xs={12} md={6}>
					<DesktopLectureDashboard term={term} />
				</Grid>
			</Grid>

			<DesktopSpacer vertical={4} />

			<DesktopBanner />

			<DesktopSpacer vertical={4} />

			<Grid container spacing={2}>
				<Grid item xs={12} md={6}>
					{/* 공지사항, 강의자료 게시물 리스트 */}
					<DesktopContentList
						title={Object.values(PostVariantNames).join(' · ')}
						list={postList}
						defaultThreshold={6}
						expandThresholdSize={8}
						groupByCreatedAt
						VirtualListProps={{
							defaultThreshold: 8,
							expandThresholdSize: 8,
						}}
						ListItemProps={{
							SubtitleProps: { course: true },
						}}
					/>
				</Grid>
				<Grid item xs={12} md={6}>
					{/* 과제, 팀 프로젝트, 수업활동일지 게시물 리스트 */}
					<DesktopContentList
						title={Object.values(AssignmentVariantNames).join(' · ')}
						list={assignmentList}
						VirtualListProps={{
							defaultThreshold: 8,
							expandThresholdSize: 8,
						}}
						ListItemProps={{
							SubtitleProps: { course: true },
						}}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};
