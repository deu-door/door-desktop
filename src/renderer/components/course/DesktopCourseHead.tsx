import { Box, Grid, styled, Typography, withTheme } from '@material-ui/core';
import { Class, Person } from '@material-ui/icons';
import { ToggleButton, ToggleButtonGroup, ToggleButtonGroupProps } from '@material-ui/lab';
import React, { useEffect } from 'react';
import { Course } from 'door-api';
import { useCourse } from '../../hooks/door/useCourse';

const DesktopCourseTag = (props: { icon: React.ReactElement; text: string }) => (
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

type Menu = {
	label: string;
	value: string;
	group: string;
};

export type DeDesktopCourseMenuNavigatorProps = {
	course: Course;
	value: string | undefined;
	menuList: Array<Menu>;
	onChange?: (menu: Menu) => void;
};

export const DesktopCourseMenuNavigator: React.FC<DeDesktopCourseMenuNavigatorProps> = props => {
	const { course, value, menuList, onChange } = props;
	const { fetchCourseSyllabus } = useCourse();

	useEffect(() => {
		fetchCourseSyllabus(course.id);
	}, []);

	return (
		<Box component="header" position="sticky" top={0} bgcolor="background.default" zIndex={1}>
			<Grid container spacing={2} alignItems="flex-end">
				<Grid item>
					<Typography variant="h4">{course.name}</Typography>
				</Grid>

				<Grid item>
					<DesktopCourseTag icon={<Class fontSize="inherit" />} text={`${course.division}분반`} />
				</Grid>
				<Grid item>
					<DesktopCourseTag icon={<Person fontSize="inherit" />} text={course.professor} />
				</Grid>
			</Grid>

			<Box marginTop="1.2rem">
				{Array.from(menuList.reduce((accumulator, menu) => accumulator.add(menu.group), new Set<string>())).map(group => (
					<TabStyledToggleButtonGroup key={group} value={value}>
						{menuList
							.filter(menu => menu.group === group)
							.map(menu => (
								<ToggleButton key={menu.value} value={menu.value} onClick={() => onChange?.(menu)}>
									{menu.label}
								</ToggleButton>
							))}
					</TabStyledToggleButtonGroup>
				))}
			</Box>
		</Box>
	);
};
