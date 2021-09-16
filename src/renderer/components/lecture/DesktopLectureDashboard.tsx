import { Box, Typography, useTheme } from '@material-ui/core';
import { amber, green, grey, yellow } from '@material-ui/core/colors';
import { makeStyles } from '@material-ui/styles';
import { Lecture, LectureProgress, Term } from 'door-api';
import React from 'react';
import { lectureListURI, lectureURI } from '../../../common/uri/uri';
import { useCourse } from '../../hooks/door/useCourse';
import { useLecture } from '../../hooks/door/useLecture';
import { DesktopDate } from '../common/DesktopDate';
import { DesktopDuration } from '../common/DesktopDuration';
import { DesktopRequestButton } from '../common/DesktopRequestButton';
import { DesktopRequestState } from '../common/DesktopRequestState';
import { DesktopSpacer } from '../common/DesktopSpacer';

const useStyles = makeStyles({
	lectureTile: {
		opacity: 0.8,

		'&:hover': {
			opacity: 1,
		},
	},
});

type LectureTileProps = {
	lecture: Lecture | undefined;
	progress: LectureProgress | undefined;
};

const LectureTile: React.FC<LectureTileProps> = props => {
	const { lecture, progress } = props;
	const classes = useStyles();
	const theme = useTheme();
	const { openLecture } = useLecture();

	const progressSize =
		lecture?.attendance === '출석'
			? '100%'
			: lecture?.attendance === '미수강' || progress === undefined
			? '0%'
			: // progress bar size range: 5% ~ 95%
			  `${Math.min(progress.current / progress.length, 1) * 90 + 5}%`;

	const backgroundColor = lecture === undefined ? 'trasparent' : lecture?.url === undefined ? grey[200] : yellow[200];
	const foregroundColor = lecture?.attendance === '출석' ? green['A400'] : amber['A400'];

	const textColor = backgroundColor === 'trasparent' ? undefined : theme.palette.getContrastText(backgroundColor);

	const lectureAvailable = lecture?.url !== undefined;

	return (
		<Box
			className={classes.lectureTile}
			height={theme.spacing(4.5)}
			width={theme.spacing(4.5)}
			bgcolor={backgroundColor}
			color={textColor}
			display="flex"
			alignItems="center"
			justifyContent="left"
			position="relative"
			style={{ cursor: lectureAvailable ? 'pointer' : undefined }}
			onClick={() => lectureAvailable && openLecture(lectureURI(lecture))}
		>
			<Box width={progressSize} height="100%" bgcolor={foregroundColor} />
			<Box position="absolute" fontSize="0.7rem" color={textColor} width="100%" textAlign="center">
				{lecture?.url !== undefined ? lecture?.attendance : lecture?.type}
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
								<Box display="flex" alignItems="center">
									<Typography variant="h6">수강중인 강의 목록</Typography>
									<DesktopSpacer horizontal={1} />
									<Typography variant="subtitle2" color="textSecondary">
										(~ <DesktopDate date={durationTo} format="MMMM Do" />)
									</Typography>
									<DesktopSpacer horizontal="auto" />
									<DesktopDuration to={durationTo} />
								</Box>
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
