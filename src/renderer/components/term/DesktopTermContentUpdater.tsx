import { Box, CircularProgress, IconButton, Paper, Typography, useTheme } from '@material-ui/core';
import { Term } from 'door-api';
import React from 'react';
import { useCourse } from '../../hooks/door/useCourse';
import { createBatchAction } from '../../../common/batchAction/batchAction';
import { actions } from '../../../common/modules';
import { useDispatch } from 'react-redux';
import { useBatchAction } from '../../hooks/batchAction/useBatchAction';
import { useRequestMetadata } from '../../hooks/request/useRequestMetadata';
import { batchActionURI } from '../../../common/uri/uri';
import { DesktopDate } from '../common/DesktopDate';
import { Refresh } from '@material-ui/icons';

export type DesktopTermContentUpdaterProps = {
	term: Term;
};

export const DesktopTermContentUpdater: React.FC<DesktopTermContentUpdaterProps> = props => {
	const { term } = props;
	const theme = useTheme();
	const dispatch = useDispatch();
	const { courseListByTerm } = useCourse();
	const { requestMetadataByURI } = useRequestMetadata();
	const { batchActionProgressById } = useBatchAction();

	const courseList = courseListByTerm(term.id);
	const requestMetadata = requestMetadataByURI(batchActionURI(term));
	const batchActionProgress = batchActionProgressById(term.id);

	const fetch = () => {
		if (batchActionProgress?.state === 'progressing') return;

		const batchAction = createBatchAction(
			term.id,
			courseList
				.map(course => [
					{
						action: actions.fetchNoticePostList(course.id),
						message: `${course.name} 강의의 공지사항 목록을 가져오는 중입니다 ...`,
					},
					{
						action: actions.fetchReferencePostList(course.id),
						message: `${course.name} 강의의 강의자료 목록을 가져오는 중입니다 ...`,
					},
					{
						action: actions.fetchHomeworkList(course.id),
						message: `${course.name} 강의의 과제 목록을 가져오는 중입니다 ...`,
					},
					{
						action: actions.fetchTeamProjectList(course.id),
						message: `${course.name} 강의의 팀 프로젝트 목록을 가져오는 중입니다 ...`,
					},
					{
						action: actions.fetchActivityList(course.id),
						message: `${course.name} 강의의 수업활동일지 목록을 가져오는 중입니다 ...`,
					},
					{
						action: actions.fetchLectureList(course.id),
						message: `${course.name} 강의의 출석 상태 정보를 가져오는 중입니다 ...`,
					},
					{
						action: actions.fetchLectureProgressList(course.id),
						message: `${course.name} 강의의 강의 진행 정보를 가져오는 중입니다 ...`,
					},
				])
				.flat(),
		);

		dispatch(batchAction);
	};

	return (
		<Paper elevation={0} style={{ borderRadius: 0 }}>
			<Box paddingX={3} height={theme.spacing(9)} display="flex" justifyContent="space-between" alignItems="center">
				<Typography variant="h6">
					{batchActionProgress?.state !== 'progressing' ? (
						requestMetadata.fulfilledAt === undefined ? (
							<>오른쪽의 새로고침 아이콘을 클릭하여 게시물 리스트를 최신화해주세요</>
						) : (
							<>
								<DesktopDate date={requestMetadata.fulfilledAt} fromNow />에 최신화하였음
							</>
						)
					) : (
						batchActionProgress !== undefined && (
							<>
								{batchActionProgress.message} ({batchActionProgress.current} / {batchActionProgress.total})
							</>
						)
					)}
				</Typography>
				{batchActionProgress?.state === 'progressing' ? (
					<CircularProgress variant="determinate" value={batchActionProgress.progress * 100} />
				) : (
					<IconButton color="inherit" onClick={fetch}>
						<Refresh />
					</IconButton>
				)}
			</Box>
		</Paper>
	);
};
