import { Box, Button, createStyles, makeStyles, Typography } from '@material-ui/core';
import { blue, blueGrey, brown, deepOrange, green, grey, indigo, lime, orange, purple, red, yellow } from '@material-ui/core/colors';
import { Clear, Close } from '@material-ui/icons';
import { ICourse } from 'models/door';
import React, { useState } from 'react';

const useStyles = makeStyles(theme =>
	createStyles({
		table: {
			width: '100%',
			borderCollapse: 'collapse',
			borderSpacing: 0,
			tableLayout: 'fixed',

			'& td': {
				borderWidth: '2px',
				borderStyle: 'solid',
				borderColor: 'white',
				textAlign: 'center',
				backgroundColor: grey[50],
			},

			'& > thead td': {
				height: '1.2rem',
			},

			'& > tbody td': {
				height: '3rem',
			},
		},
		tableTimeColumn: {
			width: '3.2rem',
		},
	}),
);

export type TimeTableProps = {
	courses: ICourse[];
	onSelect?: (course: ICourse | undefined) => void;
};

export const TimeTable: React.FC<TimeTableProps> = props => {
	const { courses, onSelect } = props;
	const classes = useStyles();

	// 요일: 월, 화, 수, 목 ...
	const days = ['월', '화', '수', '목', '금'];

	// table[요일][시간]
	const table: Record<string, Record<number, { course: ICourse; color: Record<keyof typeof red, string> } | undefined>> = {};

	days.forEach(day => (table[day] = {}));

	const colors = [red, purple, indigo, blue, green, orange, deepOrange, brown, blueGrey];

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

	// currently focused course
	const [focused, setFocused] = useState<ICourse | undefined>(undefined);
	const [selected, setSelected] = useState<ICourse | undefined>(undefined);

	const handleSelect = (course: ICourse | undefined) => {
		// if select once again, release
		if (course !== undefined && selected?.id === course.id) {
			setSelected(undefined);
			onSelect?.(undefined);
		} else {
			setSelected(course);
			onSelect?.(course);
		}
	};

	return (
		<Typography variant="caption" color="textSecondary">
			<table className={classes.table}>
				<thead>
					<tr>
						<td className={classes.tableTimeColumn}>시간</td>
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

			<Box display="flex" visibility={selected ? undefined : 'collapse'} justifyContent="space-around" marginTop="0.5rem">
				<Button startIcon={<Clear />} onClick={() => handleSelect(undefined)} size="small">
					선택 취소
				</Button>
			</Box>
		</Typography>
	);
};
