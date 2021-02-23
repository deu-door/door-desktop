import {
	createStyles,
	makeStyles,
	Step,
	StepButton,
	StepContent,
	Stepper,
} from '@material-ui/core';
import { FetchableList } from 'components/fetchable/FetchableList';
import { FetchButton } from 'components/fetchable/FetchButton';
import React, { useState } from 'react';
import { Course } from 'services/door/interfaces/course';
import { actions } from 'store/modules';
import { LecturePost } from './LecturePost';

const useStyles = makeStyles(theme =>
	createStyles({
		lecturesByWeek: {
			flexDirection: 'column-reverse',
		},
	}),
);

export const LecturePostList: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
	const now = new Date();

	const currentWeekIndex = Object.values(course.lectures.items).findIndex(
		lecture => {
			return (
				new Date(lecture.period.from) <= now &&
				now <= new Date(lecture.period.to)
			);
		},
	);

	const [activeWeek, setActiveWeek] = useState(
		currentWeekIndex !== -1
			? currentWeekIndex
			: Object.values(course.lectures.items).length - 1,
	);

	return (
		<FetchableList
			fetchableMap={course.lectures}
			action={actions.lectures(course.id)}
		>
			<Stepper
				className={classes.lecturesByWeek}
				orientation="vertical"
				activeStep={activeWeek}
				nonLinear
			>
				{Object.values(course.lectures.items).map((week, index) => (
					<Step key={week.id}>
						<StepButton
							onClick={() => setActiveWeek(index)}
							completed={new Date(week.period.to) < now}
						>
							{`${week.id}주차 · 강의 ${week.count}개 · ${week.description}`}
						</StepButton>
						<StepContent>
							<FetchButton
								fetchable={week}
								action={actions.lectureByWeek(
									course.id,
									week.id,
								)}
							/>

							{Object.values(week.items).map(lecture => (
								<LecturePost key={lecture.id} post={lecture} />
							))}
						</StepContent>
					</Step>
				))}
			</Stepper>
		</FetchableList>
	);
};
