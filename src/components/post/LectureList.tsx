import { createStyles, makeStyles, Step, StepButton, StepContent, Stepper } from '@material-ui/core';
import React, { useState } from 'react';
import { Course } from 'service/door/interfaces/course';
import { actions } from 'store/modules';
import { FetchableList } from './FetchableList';
import { FetchButton } from './FetchButton';
import { LectureComponent } from './post/LectureComponent';

const useStyles = makeStyles(theme => createStyles({
	lecturesByWeek: {
		flexDirection: 'column-reverse'
	}
}));

export const LectureList: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const classes = useStyles();
	const now = new Date();

	const currentWeekIndex = Object.values(course.lectures.items).findIndex(lecture => {
		return new Date(lecture.period.from) <= now && now <= new Date(lecture.period.to);
	});

	const [ activeWeek, setActiveWeek ] = useState(currentWeekIndex !== -1 ? currentWeekIndex : Object.values(course.lectures.items).length - 1);

	return (
		<FetchableList fetchableMap={course.lectures} action={actions.lectures(course.id)}>
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
							{`${week.id}주차 · ${week.description}`}
						</StepButton>
						<StepContent>
							{Object.values(week.items).map(lecture => (
								<LectureComponent key={lecture.id} lecture={lecture} />
							))}
							<FetchButton fetchable={week} action={actions.lectureByWeek(course.id, week.id)} />
						</StepContent>
					</Step>
				))}
			</Stepper>
		</FetchableList>
	);
}