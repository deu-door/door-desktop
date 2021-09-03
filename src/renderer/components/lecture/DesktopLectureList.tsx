import { Box, createStyles, List, ListItem, makeStyles, Typography } from '@material-ui/core';
import { DesktopRequestButton } from '../common/DesktopRequestButton';
import React, { useEffect } from 'react';
import { DesktopLectureListItem } from './DesktopLectureListItem';
import { Course } from 'door-api';
import { lectureListURI, lectureProgressListURI } from '../../../common/uri/uri';
import { useLecture } from '../../hooks/door/useLecture';
import { DesktopSpacer } from '../common/DesktopSpacer';
import { runEvery, cancelRun } from '../../../common/helper/schedule';
import { DesktopRequestTrigger } from '../common/DesktopRequestTrigger';
import { useRequestMetadata } from '../../hooks/request/useRequestMetadata';

const useStyles = makeStyles(theme =>
	createStyles({
		outerBordered: {
			paddingTop: 0,
			paddingBottom: 0,
			borderTop: '1px solid #E0E0E0',

			'&:last-child': {
				borderBottom: '1px solid #E0E0E0',
			},
		},
		innerBordered: {
			'&:not(:first-child)': {
				borderTop: '1px solid #E0E0E0',
			},
		},
	}),
);

export type DesktopLectureListProps = {
	course: Course;
};

export const DesktopLectureList: React.FC<DesktopLectureListProps> = props => {
	const { course } = props;
	const classes = useStyles();
	const { lectureListByCourse, fetchLectureList, fetchLectureProgressList } = useLecture();

	const lectureList = lectureListByCourse(course.id);
	const weeks = [...new Set(lectureList.map(({ lecture }) => lecture.week))].sort((a, b) => a - b);

	const { requestMetadataByURI } = useRequestMetadata();
	const requestMetadata = {
		lecture: requestMetadataByURI(lectureListURI(course)),
		progress: requestMetadataByURI(lectureProgressListURI(course)),
	};

	const fetch = () => {
		fetchLectureList(course.id);
		fetchLectureProgressList(course.id);
	};

	// fetch lecture progresses for update state (every 60 seconds)
	useEffect(() => {
		const timer = runEvery(fetch, 1000 * 60);

		return () => cancelRun(timer);
	}, []);

	useEffect(() => {
		// at first time, lecture progress should fetched after lecture fulfilled
		if (requestMetadata.lecture.fulfilled === true && requestMetadata.progress.fulfilled !== true) {
			fetchLectureProgressList(course.id);
		}
	}, [requestMetadata.lecture.fulfilled]);

	return (
		<>
			<DesktopRequestTrigger uri={lectureListURI(course)} onRequest={fetch} />
			<DesktopRequestButton uri={lectureListURI(course)} onClick={fetch} />

			<DesktopSpacer vertical={0.7} />

			<List disablePadding>
				{weeks.map(week => (
					<ListItem className={classes.outerBordered} key={week}>
						<Box width="4rem" alignSelf="flex-start" marginTop={1}>
							<Typography variant="h5" display="inline">
								{week}
							</Typography>
							<Typography variant="subtitle1" display="inline">
								주차
							</Typography>
						</Box>
						<Box flex={1}>
							<List disablePadding>
								{lectureList
									.filter(({ lecture }) => lecture.week === week)
									.map(({ lecture, progress }) => (
										<ListItem className={classes.innerBordered} key={lecture.period}>
											<DesktopLectureListItem lecture={lecture} lectureProgress={progress} />
										</ListItem>
									))}
							</List>
						</Box>
					</ListItem>
				))}
			</List>
		</>
	);
};
