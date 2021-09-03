import { Box, BoxProps, Link, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { DesktopDate } from '../../components/common/DesktopDate';
import React from 'react';
import { Lecture, LectureProgress } from 'door-api';
import { useLecture } from '../../hooks/door/useLecture';
import { lectureURI } from '../../../common/uri/uri';
import { DesktopLectureBadge } from './DesktopLectureBadge';

// type fixing for Box element ref
declare module '@material-ui/core/Box' {
	interface BoxProps {
		ref?: React.MutableRefObject<HTMLElement>;
	}
}

const ProgressBar = React.forwardRef<HTMLElement, BoxProps & { progress: number }>(function ProgressBar({ progress, ...otherProps }, ref) {
	return (
		<Box ref={ref as React.MutableRefObject<HTMLElement>} bgcolor="black" {...otherProps}>
			<Box
				height="100%"
				width={`${Math.min(100, Math.max(0, progress * 100))}%`}
				style={{
					background: `linear-gradient(90deg, ${green['A200']} 60%, ${green['A400']})`,
				}}
			/>
		</Box>
	);
});

const ProgressDates: React.FC<{ progress: Pick<LectureProgress, 'startedAt' | 'finishedAt' | 'recentViewedAt'> }> = (props, ref) => {
	const {
		progress: { startedAt, finishedAt, recentViewedAt },
	} = props;
	const format = 'M월 D일 a h시 m분';

	if (startedAt === undefined && finishedAt === undefined && recentViewedAt === undefined) return <>학습 내역이 없습니다</>;

	return (
		<>
			{startedAt && (
				<div>
					최초 학습일 : <DesktopDate date={startedAt} format={format} />
				</div>
			)}
			{finishedAt && (
				<div>
					학습 완료일 : <DesktopDate date={finishedAt} format={format} />
				</div>
			)}
			{recentViewedAt && (
				<div>
					최근 학습일 : <DesktopDate date={recentViewedAt} format={format} />
				</div>
			)}
		</>
	);
};

export type DesktopLectureListItemProps = {
	lecture: Lecture;
	lectureProgress: LectureProgress | undefined;
};

export const DesktopLectureListItem: React.FC<DesktopLectureListItemProps> = props => {
	const { lecture, lectureProgress } = props;
	const { openLecture } = useLecture();

	return (
		<Box flex={1} display="flex" flexDirection="column">
			<Box display="flex" alignItems="center">
				<Box width="3rem">
					<Typography variant="subtitle2">{lecture.period + '차시'}</Typography>
				</Box>

				{lecture.url !== undefined ? (
					<Link component="button" underline="hover" onClick={() => openLecture(lectureURI(lecture))}>
						<Typography variant="subtitle1">{lecture.title || '-'}</Typography>
					</Link>
				) : (
					<Typography variant="subtitle1">{lecture.title || '-'}</Typography>
				)}

				{lecture.url !== undefined && lectureProgress !== undefined && (
					<Tooltip title={<ProgressDates progress={lectureProgress} />} placement="top" arrow>
						<ProgressBar
							width="17rem"
							height="0.7rem"
							marginLeft="auto"
							progress={lectureProgress.current / lectureProgress.length}
						/>
					</Tooltip>
				)}
			</Box>
			<Box display="flex" alignItems="center">
				<Box width="3rem">
					<DesktopLectureBadge type={lecture.type} />
				</Box>
				<Typography variant="subtitle2" color="textSecondary">
					<DesktopDate date={lecture.duration.from} format="MMMM Do" /> ~{' '}
					<DesktopDate date={lecture.duration.to} format="MMMM Do" />
				</Typography>
				{lectureProgress && (
					<Box width="17rem" marginLeft="auto" display="flex" justifyContent="space-between">
						<DesktopLectureBadge type={lecture.attendance} />
						<Box>
							<span style={{ fontWeight: 'bold' }}>
								{lectureProgress.startedAt !== undefined ? lectureProgress.current : ' - '}
							</span>
							<span style={{ fontSize: '0.75rem' }}>{'/' + lectureProgress.length + '분'}</span>
						</Box>
					</Box>
				)}
			</Box>
		</Box>
	);
};
