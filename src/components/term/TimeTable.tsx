import { Box, createStyles, makeStyles } from '@material-ui/core';
import { blue, brown, deepOrange, green, grey, indigo, lime, orange, purple, red, yellow } from '@material-ui/core/colors';
import { ICourse } from 'models/door';
import React from 'react';

const useStyles = makeStyles(theme =>
	createStyles({
		table: {
			width: '100%',
			borderCollapse: 'collapse',
			borderSpacing: 0,
			tableLayout: 'fixed',

			'& td': {
				borderWidth: '1px',
				borderStyle: 'solid',
				borderColor: grey[300],
				textAlign: 'center',
				height: '3rem',
			},
		},
	}),
);

export type TimeTableProps = {
	courses: ICourse[];
};

export const TimeTable: React.FC<TimeTableProps> = props => {
	const { courses } = props;
	const classes = useStyles();

	// 요일: 월, 화, 수, 목 ...
	const days = ['월', '화', '수', '목', '금'];

	// table[요일][시간]
	const table: Record<string, Record<number, { course: ICourse; color: Record<keyof typeof red, string> } | undefined>> = {};

	days.forEach(day => (table[day] = {}));

	const colors = [red, purple, indigo, blue, green, lime, yellow, orange, deepOrange, brown];

	courses.forEach((course, i) => {
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

	return (
		<table className={classes.table}>
			<thead>
				<tr>
					<td>시간</td>
					{days.map(day => (
						<td key={day}>{day}</td>
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
											backgroundColor: data.color[100],
										}}
									>
										<Box></Box>
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
	);
};
