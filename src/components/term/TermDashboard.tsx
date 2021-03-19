import { Box, Grid, Hidden, Typography } from '@material-ui/core';
import { Refresh } from '@material-ui/icons';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { Banner } from 'components/common/Banner';
import { PostList, PostListProps } from 'components/post/PostList';
import { PostListItemRenderer } from 'components/post/PostListItem';
import { useCourses } from 'hooks/door/useCourses';
import { usePosts } from 'hooks/door/usePosts';
import { useTerms } from 'hooks/door/useTerms';
import { ICourse, ITerm, PostVariant, PostVariantNames } from 'models/door';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
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

export type TermPostListProps = Omit<PostListProps, 'posts'> & {
	term: ITerm;
	// posts by course
	course?: ICourse;
	// filter by variants
	variants: PostVariant[];
};

export const TermPostList: React.FC<TermPostListProps> = props => {
	const { term, course, variants, ...otherProps } = props;
	const { coursesByTerm } = useCourses();
	const { allPosts, fetchPosts, postsStateByVariantByCourseId } = usePosts();

	// totally managed progress
	const [progress, setProgress] = useState({ pending: false, status: '새로고침' });

	const courses = course !== undefined ? [course] : coursesByTerm(term.id);
	const courseIds = new Set(courses.map(course => course.id));

	// filter posts by variant and term
	const posts = allPosts().filter(post => variants.some(variant => variant === post.variant) && courseIds.has(post.courseId));

	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	const fetch = async () => {
		if (progress.pending) return;
		setProgress({ pending: true, status: '잠시만 기다려 주세요 ...' });

		for (let i = 0; i < courses.length; i++) {
			const course = courses[i];

			for (let j = 0; j < variants.length; j++) {
				const variant = variants[j];

				await delay(300);
				setProgress({
					pending: true,
					status: `${course.name} ${PostVariantNames[variant]} 가져오는 중 ...`,
				});
				await fetchPosts({ ...course, variant });
				await delay(300);
			}
		}

		setProgress({ pending: false, status: '성공적으로 불러왔습니다.' });
	};

	const postsStates = courses
		.map(course =>
			variants.map(variant => ({
				course: course,
				variant: variant,
				state: postsStateByVariantByCourseId(course.id)(variant),
			})),
		)
		.flat();

	const anyOfPending = postsStates.find(({ state }) => state?.pending === true);
	const anyOfError = postsStates.find(({ state }) => state?.error !== undefined);

	return (
		<>
			<Box display="flex" alignItems="center">
				<Typography variant="subtitle2" color="textSecondary">
					{variants.map(variant => PostVariantNames[variant]).join('/')}
				</Typography>
				<Box width="0.8rem" />
				<AsyncThunkState
					onClick={fetch}
					state={
						anyOfPending?.state ??
						anyOfError?.state ?? {
							...progress,
							error: undefined,
							fulfilledAt: '0',
						}
					}
					pending={
						anyOfPending !== undefined
							? `${anyOfPending.course.name} ${PostVariantNames[anyOfPending.variant]} 가져오는 중 ...`
							: progress.status
					}
					fulfilled={progress.status}
					{...((anyOfPending !== undefined || progress.pending) === false
						? { color: 'primary.main', startIcon: <Refresh />, style: { cursor: 'pointer' } }
						: {})}
				/>
			</Box>
			<Box height="0.3rem" />
			<PostList
				posts={posts}
				threshold={8}
				itemRenderer={post => (
					<PostListItemRenderer
						key={`${post.variant}#${post.id}`}
						post={post}
						PostSubtitleProps={{ showCourse: true, showVariant: true, showAuthor: false }}
					/>
				)}
				{...otherProps}
			/>
		</>
	);
};

export type TermDashboardProps = {
	term: ITerm;
};

export const TermDashboard: React.FC<TermDashboardProps> = props => {
	const { term } = props;
	const { coursesByTerm, fetchCourseSyllabus } = useCourses();
	const courses = coursesByTerm(term.id);
	const [selected, setSelected] = useState<ICourse | undefined>(undefined);

	const messages = [
		'이번 학기 잘 보내고 있나요?',
		'과제는 미리미리 끝내요!',
		'조금만 더 힘을 내요. 종강까지!',
		'종강이 멀지 않았어요. 화이팅!',
		'동의대의 아름다운 밤 경치를 보신 적 있나요?',
		'정보관 8층에서 내려다 보는 경치는 정말 멋져요.',
	];

	const [tip] = useState(messages[Math.floor(Math.random() * messages.length)]);

	useEffect(() => {
		// fetch all course's syllabus
		const fulfill = async () => {
			for (const course of courses.filter(course => course.syllabus === undefined)) {
				await fetchCourseSyllabus(course);
			}
		};

		fulfill();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [term]);

	return (
		<Box flex={1}>
			<Box>
				<Typography variant="subtitle1" color="textSecondary">
					{term.name}
				</Typography>
				<Typography variant="h5">{tip}</Typography>
			</Box>

			<Box height="2rem" />

			<Grid container spacing={2} direction="row-reverse">
				<Grid item sm={12} md={6}>
					<Box>
						<Typography variant="subtitle2" color="textSecondary">
							시간표
						</Typography>
						<Box height="0.3rem" />
						<TimeTable courses={courses} onSelect={setSelected} />
					</Box>
				</Grid>

				<Hidden mdUp>
					<Grid item sm={12}>
						<Box minHeight="3rem" />
					</Grid>
				</Hidden>

				<Grid item sm={12} md={6}>
					<TermPostList term={term} course={selected} threshold={6} variants={[PostVariant.notice, PostVariant.reference]} />
				</Grid>
			</Grid>

			<Box height="3rem" />

			<Banner />

			<Box height="3rem" />

			<Grid container>
				<Grid item sm={12}>
					<TermPostList
						term={term}
						course={selected}
						threshold={3}
						variants={[PostVariant.assignment, PostVariant.activity, PostVariant.teamProject]}
					/>
				</Grid>
			</Grid>
		</Box>
	);
};
