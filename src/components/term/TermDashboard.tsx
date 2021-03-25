import { Box, Grid, Hidden, Typography } from '@material-ui/core';
import { Banner } from 'components/common/Banner';
import { useCourses } from 'hooks/door/useCourses';
import { useTerms } from 'hooks/door/useTerms';
import { useOnlineResources } from 'hooks/online-resources/useOnlineResources';
import { ICourse, ITerm, PostVariant } from 'models/door';
import React, { useEffect, useState } from 'react';
import { RouteComponentProps } from 'react-router-dom';
import { TermPostList } from './TermPostList';
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

export type TermDashboardProps = {
	term: ITerm;
};

export const TermDashboard: React.FC<TermDashboardProps> = props => {
	const { term } = props;
	const { coursesByTerm, fetchCourseSyllabus } = useCourses();
	const courses = coursesByTerm(term.id);
	const [selected, setSelected] = useState<ICourse | undefined>(undefined);

	const { splashTexts } = useOnlineResources();

	const [tip] = useState(splashTexts[Math.floor(Math.random() * splashTexts.length)]);

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
				<Grid item xs={12} md={6}>
					<Box>
						<Typography variant="subtitle2" color="textSecondary">
							시간표
						</Typography>
						<Box height="0.3rem" />
						<TimeTable courses={courses} onSelect={setSelected} />
					</Box>
				</Grid>

				<Hidden mdUp>
					<Grid item xs={12}>
						<Box minHeight="3rem" />
					</Grid>
				</Hidden>

				<Grid item xs={12} md={6}>
					<TermPostList term={term} course={selected} threshold={6} variants={[PostVariant.notice, PostVariant.reference]} />
				</Grid>
			</Grid>

			<Box height="1rem" />

			<Banner />

			<Box height="3rem" />

			<Grid container>
				<Grid item xs={12}>
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
