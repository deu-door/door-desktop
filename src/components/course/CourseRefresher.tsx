import { Alert, AlertTitle } from "@material-ui/lab";
import { useEffect, useState } from "react";
import { useDispatch } from "react-redux";
import { Course } from "service/door/interfaces/course";
import { actions } from "store/modules";
import { DateTime } from "../DateTime";
import React from 'react';

export const CourseRefresher: React.FC<{ course: Course }> = props => {
	const { course } = props;
	const [description, setDescription] = useState('');
	const [pending, setPending] = useState(false);
	const [lastCheckedDate, setLastCheckedDate] = useState(0);
	const dispatch = useDispatch();

	const PHASE_DELAY = -1;
	const PHASE_POSTS = 0;
	const PHASE_LECTURES = 1;
	const PHASE_END = 2;
	const [phase, setPhase] = useState(PHASE_DELAY);

	const errors = [
		course.notices.error,
		course.lectures.error,
		course.assignments.error,
		course.references.error
	].filter(error => !!error);

	useEffect(() => {
		if(phase !== PHASE_DELAY) return;

		setPending(true);
		setDescription('잠시만 기다려주세요 ...');

		const timer = setTimeout(() => setPhase(PHASE_POSTS), 500);

		return () => clearTimeout(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phase]);

	useEffect(() => {
		if(phase !== PHASE_POSTS) return;

		const fetch = async () => {
			for(const { description, action } of [
				{ description: '공지사항을 가져오는 중입니다 ...', action: actions.notices(course.id) },
				{ description: '강의목록을 가져오는 중입니다 ...', action: actions.lectures(course.id) },
				{ description: '과제목록을 가져오는 중입니다 ...', action: actions.assignments(course.id) },
				{ description: '강의자료를 가져오는 중입니다 ...', action: actions.references(course.id) }
			]) {
				setDescription(description);
				await dispatch(action.fetchIfExpired());
			}

			setPhase(PHASE_LECTURES);
		};

		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phase]);

	useEffect(() => {
		if(phase !== PHASE_LECTURES) return;

		const fetch = async () => {
			setPending(true);

			for(const lectureByWeek of Object.values(course.lectures.items)) {
				// check we should update lectures
				if(lectureByWeek.count === Object.values(lectureByWeek.items).length) continue;

				setDescription(`${lectureByWeek.id}주차 강의목록을 가져오는 중입니다 ...`);
				await dispatch(actions.lectureByWeek(course.id, lectureByWeek.id).fetchIfExpired());
			}

			setPending(false);
			setDescription('');
			setLastCheckedDate(Date.now);
			
			setPhase(PHASE_END);
		};

		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [phase, course.lectures])

	return (
		pending ?
			<Alert severity="info" variant="filled">
				<AlertTitle>데이터 동기화 중 ...</AlertTitle>
				{description}
			</Alert>
		: errors.length > 0 ?
			<Alert severity="error" variant="filled">
				<AlertTitle>오류가 발생했습니다.</AlertTitle>
				{errors.map(error => (<div>{error}</div>))}
			</Alert>
		:
			<Alert severity="success" variant="filled">
				<AlertTitle>데이터가 최신 상태입니다.</AlertTitle>
				<span>최근 동기화 : <DateTime date={lastCheckedDate} relative /></span>
			</Alert>
	);
}