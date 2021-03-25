import { Box, Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank, Refresh } from '@material-ui/icons';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { FetchButton } from 'components/common/FetchButton';
import { PostList, PostListProps } from 'components/post/PostList';
import { PostListItemRenderer } from 'components/post/PostListItem';
import { useCourses } from 'hooks/door/useCourses';
import { usePosts } from 'hooks/door/usePosts';
import { ICourse, ITerm, PostVariant, PostVariantNames } from 'models/door';
import React, { useEffect, useState } from 'react';

export type TermPostListProps = Omit<PostListProps, 'posts'> & {
	term: ITerm;
	// posts by course
	course?: ICourse;
	// filter by variants
	variants: PostVariant[];
	// shows filter
	showFilter?: boolean;
};

export const TermPostList: React.FC<TermPostListProps> = props => {
	const { term, course, variants, showFilter = true, ...otherProps } = props;
	const { coursesByTerm } = useCourses();
	const { allPosts, fetchPosts, postsStateByVariantByCourseId } = usePosts();

	// filter by variant
	const [filteredVariants, setFilteredVariants] = useState(new Set());

	// totally managed progress (tasks[id])
	const [tasks, setTasks] = useState<Array<() => Promise<unknown>>>([]);
	const [text, setText] = useState('새로고침');

	const courses = course !== undefined ? [course] : coursesByTerm(term.id);
	const courseIds = new Set(courses.map(course => course.id));

	// filter posts by variant and term
	const posts = allPosts().filter(
		post =>
			(filteredVariants.size > 0 ? [...filteredVariants] : variants).some(variant => variant === post.variant) &&
			courseIds.has(post.courseId),
	);

	const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

	const startFetch = () => {
		setTasks(
			courses
				.map(course =>
					variants.map(variant => async () => {
						setText(`${course.name} ${PostVariantNames[variant]} 가져오는 중 ...`);

						await delay(350);
						await fetchPosts({ ...course, variant });
						await delay(350);
					}),
				)
				.flat(),
		);
	};

	// do task
	useEffect(() => {
		const doTask = async () => {
			if (tasks.length === 0) return;

			await tasks[0]();

			setTasks(tasks.splice(1));

			// all tasks finished!
			if (tasks.splice(1).length === 0) {
				setText('성공적으로 불러왔습니다.');
			}
		};

		doTask();
	}, [tasks]);

	const postsStates = courses
		.map(course =>
			variants.map(variant => ({
				course: course,
				variant: variant,
				state: postsStateByVariantByCourseId(course.id)(variant),
			})),
		)
		.flat();

	const anyOfError = postsStates.find(({ state }) => state?.error !== undefined);

	const state =
		tasks.length > 0
			? {
					pending: true,
					error: undefined,
			  }
			: anyOfError?.state ?? {
					pending: false,
					error: undefined,
					fulfilledAt: '0',
			  };

	return (
		<>
			<Box display="flex" alignItems="center">
				{showFilter ? (
					<FormControl>
						<FormGroup row>
							{variants.map((variant, index) => (
								<FormControlLabel
									key={variant}
									style={{ marginRight: 0, marginLeft: index !== 0 ? '0.7rem' : 0 }}
									control={
										<Checkbox
											style={{ padding: 0, marginRight: '0.2rem' }}
											color="primary"
											icon={<CheckBoxOutlineBlank style={{ fontSize: '1.2rem' }} />}
											checkedIcon={<CheckBox style={{ fontSize: '1.2rem' }} />}
											checked={filteredVariants.has(variant)}
											onChange={event =>
												event.target.checked
													? setFilteredVariants(new Set(filteredVariants.add(variant)))
													: setFilteredVariants(
															new Set([...filteredVariants].filter(_variant => _variant !== variant)),
													  )
											}
										/>
									}
									label={
										<Typography
											variant="subtitle2"
											color="textSecondary"
											style={{ display: 'inline-block', verticalAlign: 'middle' }}
										>
											{PostVariantNames[variant]}
										</Typography>
									}
								/>
							))}
						</FormGroup>
					</FormControl>
				) : (
					<Typography variant="subtitle2" color="textSecondary">
						{variants.map(variant => PostVariantNames[variant]).join('/')}
					</Typography>
				)}
				<Box width="0.8rem" />
				<FetchButton state={state} onFetch={startFetch}>
					<AsyncThunkState
						state={state}
						pending={text}
						fulfilled={text}
						{...(tasks.length > 0 ? {} : { color: 'primary.main', startIcon: <Refresh />, style: { cursor: 'pointer' } })}
					/>
				</FetchButton>
			</Box>
			<Box height="0.3rem" />
			<PostList
				posts={posts}
				threshold={8}
				itemRenderer={post => (
					<PostListItemRenderer
						key={`${post.variant}#${post.id}`}
						post={post}
						PostSubtitleProps={{
							showCourse: true,
							showVariant: true,
							showAuthor: false,
						}}
					/>
				)}
				{...otherProps}
			/>
		</>
	);
};
