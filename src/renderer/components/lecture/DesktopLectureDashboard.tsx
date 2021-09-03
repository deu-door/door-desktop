import { Box, Typography, useTheme } from '@material-ui/core';
import { amber, green, grey, yellow } from '@material-ui/core/colors';
import { Lecture, LectureProgress, Term } from 'door-api';
import React from 'react';
import { lectureListURI, lectureURI } from '../../../common/uri/uri';
import { useCourse } from '../../hooks/door/useCourse';
import { useLecture } from '../../hooks/door/useLecture';
import { DesktopDate } from '../common/DesktopDate';
import { DesktopRequestButton } from '../common/DesktopRequestButton';
import { DesktopRequestState } from '../common/DesktopRequestState';
import { DesktopSpacer } from '../common/DesktopSpacer';

type LectureTileProps = {
	lecture: Lecture | undefined;
	progress: LectureProgress | undefined;
};

const LectureTile: React.FC<LectureTileProps> = props => {
	const { lecture, progress } = props;
	const theme = useTheme();
	const { openLecture } = useLecture();

	const innerSize =
		lecture?.attendance === '출석'
			? '100%'
			: progress === undefined
			? '0%'
			: `${Math.min(progress.current / progress.length, 1) * 100}%`;

	return (
		<Box
			height={theme.spacing(5)}
			width={theme.spacing(5)}
			bgcolor={lecture === undefined ? 'trasparent' : lecture?.url === undefined ? grey[200] : yellow[200]}
			display="flex"
			alignItems="center"
			justifyContent="center"
			position="relative"
			{...(lecture?.url !== undefined
				? {
						style: { cursor: 'pointer' },
						onClick: () => openLecture(lectureURI(lecture)),
				  }
				: {})}
		>
			<Box width={innerSize} height={innerSize} bgcolor={lecture?.attendance === '출석' ? green['A400'] : amber['A400']} />
			<Box position="absolute">
				<Typography variant="caption">{lecture?.url !== undefined ? lecture?.attendance : lecture?.type}</Typography>
			</Box>
		</Box>
	);
};

export type DesktopLectureDashboardProps = {
	term: Term;
};

export const DesktopLectureDashboard: React.FC<DesktopLectureDashboardProps> = props => {
	const { term } = props;
	const { courseListByTerm, courseById } = useCourse();
	const { lectureList, fetchLectureList, fetchLectureProgressList } = useLecture();

	const now = new Date().toISOString();

	const courseList = courseListByTerm(term.id);
	const courseIds = new Set(courseList.map(course => course.id));

	// groupBy[durationTo][course.id][week-period] = lecture
	const groupBy: Record<string, Record<string, Record<string, { lecture: Lecture; progress: LectureProgress | undefined }>>> = {};

	const weekAndPeriods = new Set<string>();

	lectureList.forEach(({ lecture, progress }) => {
		if (!(lecture.duration.from <= now && now <= lecture.duration.to)) return;
		if (!courseIds.has(lecture.courseId)) return;

		groupBy[lecture.duration.to] ??= {};

		const course = courseById(lecture.courseId);
		if (course === undefined) return;

		groupBy[lecture.duration.to][course.id] ??= {};

		const weekAndPeriod = `${lecture.week}-${lecture.period}`;
		groupBy[lecture.duration.to][course.id][weekAndPeriod] = { lecture, progress };

		weekAndPeriods.add(weekAndPeriod);
	});

	const sortedWeekAndPeriods = [...weekAndPeriods].sort();

	return (
		<>
			{Object.keys(groupBy).length === 0 ? (
				<Typography variant="h6">진행중인 강의가 없습니다</Typography>
			) : (
				Object.keys(groupBy)
					.sort()
					.map(durationTo => {
						// make durationTo group table
						//
						// 2021년 9월 7일까지
						// 데이터베이스응용     [  ][  ][  ][  ]
						// 데이터통신          [  ][  ][  ][  ]
						return (
							<Box key={durationTo}>
								<Typography variant="h6">
									강의목록 (~
									<DesktopDate date={durationTo} format="MMMM Do" />
									까지)
								</Typography>
								<DesktopSpacer vertical={1} />
								<table>
									<thead>
										<tr>
											<th></th>
											{sortedWeekAndPeriods.map(weekAndPeriod => (
												<th key={weekAndPeriod} style={{ textAlign: 'center' }}>
													{weekAndPeriod}
												</th>
											))}
										</tr>
									</thead>
									<tbody>
										{Object.keys(groupBy[durationTo])
											.sort()
											.map(courseId => (
												<tr key={courseId}>
													<td style={{ width: '99%' }}>
														<Typography variant="subtitle1" display="inline">
															{courseById(courseId)?.name}{' '}
														</Typography>
														<DesktopRequestButton
															uri={lectureListURI({ id: courseId })}
															onClick={() => {
																fetchLectureList(courseId);
																fetchLectureProgressList(courseId);
															}}
														>
															<DesktopRequestState
																uri={lectureListURI({ id: courseId })}
																messages={{
																	error: '',
																	fulfilled: '',
																	notFulfilled: '',
																	pending: '',
																}}
															/>
														</DesktopRequestButton>
													</td>
													{sortedWeekAndPeriods.map(weekAndPeriod => (
														<td key={weekAndPeriod}>
															<LectureTile {...groupBy[durationTo][courseId][weekAndPeriod]} />
														</td>
													))}
												</tr>
											))}
									</tbody>
								</table>
							</Box>
						);
					})
			)}
		</>
	);
};
