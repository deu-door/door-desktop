import { ID } from 'services/door/interfaces';
import { store } from 'store';
import { actions, FetchableAction } from './modules';

type CurrentAction = {
	name: string;
	description?: string;
	action: FetchableAction;
};

export const sequentialCourseActions = function* (
	courseId: ID,
): IterableIterator<CurrentAction> {
	// Get current state
	let course = store.getState().courses.items[courseId];

	const sequentialActions1 = [
		{
			name: `${course.name}`,
			description: '공지사항 목록을 가져오는 중입니다',
			action: actions.notices(course.id),
		},
		{
			name: `${course.name}`,
			description: '강의 목록을 가져오는 중입니다',
			action: actions.lectures(course.id),
		},
		{
			name: `${course.name}`,
			description: '과제 목록을 가져오는 중입니다',
			action: actions.assignments(course.id),
		},
		{
			name: `${course.name}`,
			description: '강의자료 목록을 가져오는 중입니다',
			action: actions.references(course.id),
		},
		{
			name: `${course.name}`,
			description: '수업활동일지 목록을 가져오는 중입니다',
			action: actions.activities(course.id),
		},
		{
			name: `${course.name}`,
			description: '팀 프로젝트 목록을 가져오는 중입니다',
			action: actions.teamProjects(course.id),
		},
		{
			name: `${course.name}`,
			description: '수업 진행 정보를 가져오는 중입니다',
			action: actions.learningStatus(course.id),
		},
	];

	for (const currentAction of sequentialActions1) {
		yield currentAction;
	}

	// Get updated state
	course = store.getState().courses.items[courseId];

	const sequentialActions2 = Object.values(course.lectures.items)
		.filter(lecturesByWeek => {
			// 저장된 강의 개수와 홈페이지에 등록된 강의 개수가 다르면 fetch
			return (
				lecturesByWeek.count !==
				Object.values(lecturesByWeek.items).length
			);
		})
		.map(lecturesByWeek => ({
			name: `${course.name}`,
			description: `${lecturesByWeek.id}주차 강의목록을 가져오는 중입니다`,
			action: actions.lectureByWeek(
				lecturesByWeek.courseId,
				lecturesByWeek.id,
			),
		}));

	for (const currentAction of sequentialActions2) {
		yield currentAction;
	}
};

export const sequentialAllCourseActions = function* (): IterableIterator<CurrentAction> {
	yield {
		name: '강의목록',
		description: '강의 목록을 가져오는 중입니다',
		action: actions.courses(),
	};

	const courses = Object.values(store.getState().courses.items);

	for (const course of courses) {
		yield {
			name: `${course.name}`,
			description: '강의 정보를 가져오는 중입니다',
			action: actions.course(course.id),
		};

		for (const currentAction of sequentialCourseActions(course.id)) {
			yield currentAction;
		}
	}
};
