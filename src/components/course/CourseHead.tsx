import { Box, Grid, styled, Typography, withTheme } from '@material-ui/core';
import { Class, Person } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@material-ui/lab';
import { KeepLatestState } from 'components/common/KeepLatestState';
import { useCourses } from 'hooks/door/useCourses';
import { ICourse, PostVariant, PostVariantNames } from 'models/door';
import React from 'react';
import { useHistory, useLocation, useRouteMatch } from 'react-router';
import { IAsyncThunkState } from 'store/modules/util';

const CourseTag = (props: { icon: React.ReactElement; text: string }) => (
	<Grid item>
		<Grid container alignItems="center" spacing={1}>
			{props.icon}
			<Grid item>{props.text}</Grid>
		</Grid>
	</Grid>
);

const TabStyledToggleButtonGroup = styled(
	withTheme((props: ToggleButtonGroupProps) => <ToggleButtonGroup size="small" exclusive {...props} />),
)(props => ({
	height: '2rem',
	marginBottom: '1.2rem',

	'& .MuiToggleButtonGroup-groupedHorizontal': {
		width: '6rem',
	},

	'& .Mui-selected': {
		backgroundColor: props.theme.palette.primary.main,
		color: props.theme.palette.primary.contrastText,
		fontWeight: 'bold',

		'&:hover': {
			backgroundColor: props.theme.palette.primary.main,
		},
	},

	'&:not(:last-child)': {
		marginRight: '1rem',
	},
}));

export type CourseHeadProps = {
	course: ICourse & IAsyncThunkState;
};

export const CourseHead: React.FC<CourseHeadProps> = props => {
	const { course } = props;
	const { fetchCourseSyllabus } = useCourses();
	const history = useHistory();
	const location = useLocation();
	const { url } = useRouteMatch();

	const tabs = [
		{
			label: '온라인강의',
			value: 'lectures',
			url: `${url}/lectures`,
			group: 2,
		},
		{
			label: '정보',
			value: 'details',
			url: `${url}/details`,
			group: 1,
		},
		...Object.entries(PostVariantNames)
			.filter(
				([variant, name]) =>
					variant === PostVariant.notice ||
					variant === PostVariant.reference ||
					variant === PostVariant.assignment ||
					variant === PostVariant.activity ||
					variant === PostVariant.teamProject,
			)
			.map(([variant, name]) => ({
				label: name,
				value: variant,
				url: `${url}/${variant}`,
				group: 3,
			})),
	];

	const currentMatchUrl = location.pathname.replace(/(\/courses\/\w+\/\w+)\/.+/, (_, match) => match);

	return (
		<Box component="header" position="sticky" top={0} bgcolor="background.default" zIndex={1}>
			<KeepLatestState state={course} onTriggerFetch={() => fetchCourseSyllabus(course)} expirationInterval={6 * 60 * 60 * 1000} />

			<Grid container spacing={2} alignItems="flex-end">
				<Grid item>
					<Typography variant="h4">{course.name}</Typography>
				</Grid>

				<Grid item>
					<CourseTag icon={<Class fontSize="inherit" />} text={`${course.division}분반`} />
				</Grid>
				<Grid item>
					<CourseTag icon={<Person fontSize="inherit" />} text={course.professor} />
				</Grid>
			</Grid>

			<Box marginTop="1.2rem">
				{Array.from(tabs.reduce((accumulator, tab) => accumulator.add(tab.group), new Set<number>())).map(group => (
					<TabStyledToggleButtonGroup
						key={group}
						value={currentMatchUrl}
						onChange={(event, link) => location.pathname !== link && history.replace(link ?? currentMatchUrl)}
					>
						{tabs
							.filter(tab => tab.group === group)
							.map(tab => (
								<ToggleButton key={tab.value} value={tab.url}>
									{tab.label}
								</ToggleButton>
							))}
					</TabStyledToggleButtonGroup>
				))}
			</Box>
		</Box>
	);
};
