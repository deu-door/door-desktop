import { Box, Grid, Hidden, Typography } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { PostList } from 'components/post/PostList';
import { PostListItem } from 'components/post/PostListItem';
import { PostSubtitle } from 'components/post/PostSubtitle';
import { useCourses } from 'hooks/door/useCourses';
import { usePosts } from 'hooks/door/usePosts';
import { useTerms } from 'hooks/door/useTerms';
import { ITerm, PostVariant } from 'models/door';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { IAsyncThunkState } from 'store/modules/util';
import { TimeTable } from './TimeTable';

export type RouteTermDashboardProps = RouteComponentProps<{
	termId: ITerm['id'];
}>;

export const RouteTermDashboard: React.FC<RouteTermDashboardProps> = props => {
	const {
		match: {
			params: { termId },
		},
	} = props;
	const { termById } = useTerms();
	const term = termById(termId);

	if (term === undefined) return <Box>404 NOT FOUND</Box>;

	return <TermDashboard term={term} />;
};

export type TermPostListProps = {
	term: ITerm;
};

export const TermPostList: React.FC<TermPostListProps> = props => {
	const { term } = props;
	const { coursesByTerm } = useCourses();
	const { allPosts, fetchPosts, postsStateByVariantByCourseId } = usePosts();

	const [progress, setProgress] = useState({ pending: false, meter: 0, status: '' });

	const courses = coursesByTerm(term.id);
	const courseIds = new Set(courses.map(course => course.id));

	const posts = allPosts().filter(
		post => (post.variant === PostVariant.notice || post.variant === PostVariant.reference) && courseIds.has(post.courseId),
	);

	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	const fetch = async () => {
		if (progress.pending) return;
		setProgress({ pending: true, meter: 0, status: '잠시만 기다려 주세요 ...' });

		for (let i = 0; i < courses.length; i++) {
			const course = courses[i];

			await delay(500);

			setProgress({ pending: true, meter: i / courses.length, status: `${course.name} 공지사항 가져오는 중 ...` });
			await fetchPosts({ ...course, variant: PostVariant.notice });

			await delay(500);

			setProgress({ pending: true, meter: (i + 0.5) / courses.length, status: `${course.name} 강의자료 가져오는 중 ...` });
			await fetchPosts({ ...course, variant: PostVariant.reference });
		}

		setProgress({ pending: false, meter: 1, status: '성공적으로 불러왔습니다.' });
	};

	const postsStates = courses
		.map(course => [PostVariant.notice, PostVariant.reference].map(variant => postsStateByVariantByCourseId(course.id)(variant)))
		.flat()
		.filter((postsState): postsState is IAsyncThunkState => postsState !== undefined);

	return (
		<Box>
			<Box display="flex" alignItems="center">
				<Typography variant="subtitle2" color="textSecondary">
					공지사항/강의자료
				</Typography>
				<Box width="0.8rem" />
				<AsyncThunkState
					onClick={fetch}
					state={
						(progress.pending ? undefined : postsStates.find(postsState => postsState.error)) ?? {
							...progress,
							error: undefined,
							fulfilledAt: '0',
						}
					}
					pending={progress.status}
					fulfilled="새로고침"
					{...(progress.pending === false ? { color: 'primary.main', startIcon: <Refresh />, style: { cursor: 'pointer' } } : {})}
				/>
			</Box>
			<Box height="0.3rem" />
			<PostList
				posts={posts}
				threshold={8}
				itemRenderer={post => (
					<PostListItem post={post} secondary={<PostSubtitle post={post} showCourse showVariant showAuthor={false} />} />
				)}
			/>
		</Box>
	);
};

export type TermDashboardProps = {
	term: ITerm;
};

export const TermDashboard: React.FC<TermDashboardProps> = props => {
	const { term } = props;
	const { coursesByTerm, fetchCourseSyllabus } = useCourses();
	const courses = coursesByTerm(term.id);

	const messages = ['이번 학기 잘 보내고 있나요?', '과제는 미리미리 끝내요!', '그만큼 지옥같으시단거지~'];

	useEffect(() => {
		// fetch all course's syllabus
		const fulfill = async () => {
			for (const course of courses.filter(course => course.syllabus === undefined)) {
				await fetchCourseSyllabus(course);
			}
		};

		fulfill();
	}, [term]);

	return (
		<Box flex={1}>
			<Box>
				<Typography variant="subtitle1" color="textSecondary">
					{term.name}
				</Typography>
				<Typography variant="h5">{messages[Math.floor(Math.random() * messages.length)]}</Typography>
			</Box>

			<Box height="2rem" />

			<Grid container spacing={2} direction="row-reverse">
				<Grid item sm={12} md={6}>
					<Box>
						<Typography variant="subtitle2" color="textSecondary">
							시간표
						</Typography>
						<Box height="0.3rem" />
						<TimeTable courses={courses} />
					</Box>
				</Grid>

				<Hidden mdUp>
					<Grid item sm={12}>
						<Box minHeight="3rem" />
					</Grid>
				</Hidden>

				<Grid item sm={12} md={6}>
					<TermPostList term={term} />
				</Grid>
			</Grid>
		</Box>
	);
};
