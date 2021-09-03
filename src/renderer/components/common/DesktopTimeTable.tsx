import { Box, Button, createStyles, makeStyles, Typography } from '@material-ui/core';
import { blue, blueGrey, brown, deepOrange, green, indigo, orange, purple, red } from '@material-ui/core/colors';
import { Clear } from '@material-ui/icons';
import { Course } from 'door-api';
import React, { useState } from 'react';

const useStyles = makeStyles(theme =>
	createStyles({
		table: {
			width: '100%',
			borderCollapse: 'separate',
			borderSpacing: '2px',
			tableLayout: 'fixed',

			'& th,td': {
				textAlign: 'center',
				backgroundColor: theme.palette.background.paper,
			},

			'& > thead th': {
				height: '1.2rem',
			},

			'& > tbody td': {
				height: '3rem',
			},
		},
	}),
);

export type DesktopTimeTableProps = {
	courseList: Course[];
	selected?: Course | undefined;
	onSelect?: (course: Course | undefined) => void;
};

export const DesktopTimeTable: React.FC<DesktopTimeTableProps> = props => {
	const { courseList, selected, onSelect } = props;
	const classes = useStyles();

	// 요일: 월, 화, 수, 목 ...
	const days = ['월', '화', '수', '목', '금'];

	// table[요일][시간]
	const table: Record<string, Record<number, { course: Course; color: Record<keyof typeof red, string> } | undefined>> = {};

	days.forEach(day => (table[day] = {}));

	const colors = [red, purple, indigo, blue, green, orange, deepOrange, brown, blueGrey];

	courseList.forEach((course, i) => {
		if (course.syllabus === undefined) return;

		course.syllabus.times.forEach(({ day, times }) => {
			times.forEach(time => {
				if (!(day in table)) table[day] = {};

				table[day][time] = {
					course: course,
					color: colors[i % colors.length],
				};
			});
		});
	});

	// 시간: 1교시, 2교시, 3교시 ...
	const times = [
		...Array(Object.values(table).reduce((acc, current) => Math.max(acc, ...Object.keys(current).map(Number)), 8)).keys(),
	].map(i => i + 1);

	// currently focused (hover) course
	const [focused, setFocused] = useState<Course | undefined>(undefined);

	const handleSelect = (course: Course | undefined) => {
		// if select once again, release
		if (course !== undefined && selected?.id === course.id) {
			onSelect?.(undefined);
		} else {
			onSelect?.(course);
		}
	};

	return (
		<Typography variant="caption" color="textSecondary">
			<table className={classes.table}>
				<thead>
					<tr>
						<th style={{ width: '3.2rem' }}>시간</th>
						{days.map(day => (
							<th key={day}>{day}</th>
						))}
					</tr>
				</thead>
				<tbody>
					{times.map(time => (
						<tr key={time}>
							<td>{`${time + 8}:00`}</td>
							{days
								.map(day => ({ day, data: table[day]?.[time] }))
								.map(({ day, data }) =>
									data !== undefined ? (
										<td
											key={day}
											style={{
												backgroundColor: data.color[500],
												cursor: 'pointer',
												color: 'white',
												opacity:
													selected !== undefined
														? selected.id === data.course.id
															? 1
															: 0.3
														: focused !== undefined
														? focused.id === data.course.id
															? 0.8
															: 0.3
														: 0.7,
											}}
											onMouseEnter={() => setFocused(data.course)}
											onMouseLeave={() => setFocused(undefined)}
											onClick={() => handleSelect(data.course)}
										>
											{data.course.name}
										</td>
									) : (
										<td key={day} />
									),
								)}
						</tr>
					))}
				</tbody>
			</table>

			<Box
				display="flex"
				visibility={selected === undefined ? 'collapse' : 'visible'}
				justifyContent="space-around"
				marginTop="0.5rem"
			>
				<Button startIcon={<Clear />} onClick={() => handleSelect(undefined)} size="small">
					선택 취소
				</Button>
			</Box>
		</Typography>
	);
};
