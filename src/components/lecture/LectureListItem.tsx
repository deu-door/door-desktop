import { Box, BoxProps, Link, Tooltip, Typography } from '@material-ui/core';
import { green } from '@material-ui/core/colors';
import { DateTime } from 'components/common/DateTime';
import { ILecture, ILectureProgress } from 'models/door';
import React from 'react';

// type fixing for Box element ref
declare module '@material-ui/core/Box' {
	interface BoxProps {
		ref?: React.MutableRefObject<HTMLElement>;
	}
}

const ProgressBar = React.forwardRef<HTMLElement, BoxProps & { progress: number }>(function ProgressBar({ progress, ...otherProps }, ref) {
	return (
		<Box ref={ref as React.MutableRefObject<HTMLElement>} bgcolor="black" {...otherProps}>
			<Box height="100%" width={`${Math.min(100, Math.max(0, progress * 100))}%`} bgcolor={green['A200']} />
		</Box>
	);
});

const ProgressDates: React.FC<{ progress: ILectureProgress }> = (props, ref) => {
	const {
		progress: { startedAt, finishedAt, recentViewedAt },
	} = props;
	const format = 'M월 D일 a h시 m분';

	if (startedAt === undefined && finishedAt === undefined && recentViewedAt === undefined) return <>학습 내역이 없습니다</>;

	return (
		<>
			{startedAt && (
				<div>
					최초 학습일 : <DateTime date={startedAt} format={format} />
				</div>
			)}
			{finishedAt && (
				<div>
					학습 완료일 : <DateTime date={finishedAt} format={format} />
				</div>
			)}
			{recentViewedAt && (
				<div>
					최근 학습일 : <DateTime date={recentViewedAt} format={format} />
				</div>
			)}
		</>
	);
};

const TypeBadge: React.FC<{ type: ILecture['type'] }> = props => {
	const { type } = props;

	const color =
		type === '대면'
			? '#812BFE'
			: type === '시험'
			? '#357C64'
			: type === '강의'
			? '#F559AE'
			: type === '출석'
			? '#57B6EC'
			: type === '완료전'
			? '#B8B7B7'
			: type === '미수강'
			? '#B464EE'
			: type === '결석'
			? '#FA6556'
			: type === '지각'
			? '#FA9C2F'
			: '#B7B7B7';

	return (
		<Box borderRadius="0.2rem" bgcolor={color} color="white" display="inline-block" paddingX="0.4rem" fontSize="0.8rem">
			{type}
		</Box>
	);
};

export type LectureListItemProps = {
	lecture: ILecture;
};

export const LectureListItem: React.FC<LectureListItemProps> = props => {
	const { lecture } = props;

	return (
		<Box flex={1} display="flex" flexDirection="column">
			<Box display="flex" alignItems="center">
				<Box width="3rem">
					<Typography variant="subtitle2">{lecture.period + '차시'}</Typography>
				</Box>

				{lecture.link !== undefined ? (
					<Link
						component="a"
						underline="hover"
						href={`${window.location.origin}${window.location.pathname}#/external?link=${encodeURIComponent(
							lecture.link ?? '',
						)}`}
						target="_blank"
					>
						<Typography variant="subtitle1">{lecture.title || '-'}</Typography>
					</Link>
				) : (
					<Typography variant="subtitle1">{lecture.title || '-'}</Typography>
				)}

				{lecture.progress?.startedAt !== undefined ? (
					<Tooltip title={<ProgressDates progress={lecture.progress} />} placement="top" arrow>
						<ProgressBar
							width="20rem"
							height="1rem"
							marginLeft="auto"
							progress={lecture.progress.current / lecture.progress.length}
						/>
					</Tooltip>
				) : undefined}
			</Box>
			<Box display="flex" alignItems="center">
				<Box width="3rem">
					<TypeBadge type={lecture.type} />
				</Box>
				<Typography variant="subtitle2" color="textSecondary">
					{lecture.duration.from + ' ~ ' + lecture.duration.to}
				</Typography>
				{lecture.progress && (
					<Box width="20rem" marginLeft="auto" display="flex" justifyContent="space-between">
						{lecture.attendance === '-' ? <span>-</span> : <TypeBadge type={lecture.attendance} />}
						<span>
							<span style={{ fontWeight: 'bold' }}>
								{lecture.progress.startedAt !== undefined ? lecture.progress.current : ' - '}
							</span>
							<span style={{ fontSize: '0.75rem' }}>{'/' + lecture.progress.length + '분'}</span>
						</span>
					</Box>
				)}
			</Box>
		</Box>
	);
};
