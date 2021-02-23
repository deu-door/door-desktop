import { Alert, AlertTitle } from '@material-ui/lab';
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { Course } from 'service/door/interfaces/course';
import React from 'react';
import { DateTime } from 'components/core/DateTime';
import { sequentialCourseActions } from 'store/sequential-actions';

export const CourseRefresher: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const [description, setDescription] = useState('');
	const [pending, setPending] = useState(false);
	const [lastCheckedDate, setLastCheckedDate] = useState(0);
	const dispatch = useDispatch();

	const PHASE_DELAY = -1;
	const PHASE_POSTS = 0;
	const PHASE_END = 1;
	const [phase, setPhase] = useState(PHASE_DELAY);

	const errors = [
		course.notices.error,
		course.lectures.error,
		course.assignments.error,
		course.references.error,
		course.activities.error,
		course.teamProjects.error,
		course.learningStatus.error,
	].filter(error => !!error);

	useEffect(() => {
		if (phase !== PHASE_DELAY) return;

		setPending(true);
		setDescription('잠시만 기다려주세요 ...');

		const timer = setTimeout(() => setPhase(PHASE_POSTS), 500);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phase]);

	useEffect(() => {
		if (phase !== PHASE_POSTS) return;

		const fetch = async () => {
			for (const currentAction of sequentialCourseActions(course.id)) {
				setDescription(currentAction.description || '');
				await dispatch(currentAction.action.fetchIfExpired());
			}

			setPending(false);
			setDescription('');
			setLastCheckedDate(Date.now);

			setPhase(PHASE_END);
		};

		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phase]);

	return pending ? (
		<Alert severity="info" variant="filled">
			<AlertTitle>데이터 동기화 중 ...</AlertTitle>
			{description}
		</Alert>
	) : errors.length > 0 ? (
		<Alert severity="error" variant="filled">
			<AlertTitle>오류가 발생했습니다.</AlertTitle>
			{errors.map(error => (
				<div key={error?.toString()}>{error}</div>
			))}
		</Alert>
	) : (
		<Alert severity="success" variant="filled">
			<AlertTitle>데이터가 최신 상태입니다.</AlertTitle>
			<span>
				최근 동기화 : <DateTime date={lastCheckedDate} relative />
			</span>
		</Alert>
	);
};
