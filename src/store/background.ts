import { Course } from "service/door/interfaces/course";
import { store } from "store";
import { actions, FetchableAction } from "./modules";

type IteratorItem = {
	title: string,
	subtitle?: string,
	course?: Course,
	action: FetchableAction
}

const courseRefreshGenerator = function *() {
	yield {
		title: '강의목록',
		subtitle: '강의목록을 가져오는 중입니다',
		action: actions.courses()
	} as IteratorItem;

	const courses = store.getState().courses;

	const targets_phase1: IteratorItem[] = Object.values(courses.items).map(course => [
		{
			title: `${course.name}`,
			subtitle: '공지사항을 가져오는 중입니다',
			action: actions.notices(course.id)
		},
		{
			title: `${course.name}`,
			subtitle: '강의목록을 가져오는 중입니다',
			action: actions.lectures(course.id)
		},
		{
			title: `${course.name}`,
			subtitle: '과제목록을 가져오는 중입니다',
			action: actions.assignments(course.id)
		},
		{
			title: `${course.name}`,
			subtitle: '강의자료를 가져오는 중입니다',
			action: actions.references(course.id)
		}
	]).flat();

	for(const item of targets_phase1) {
		yield item;
	}

	const lectures = Object.values(store.getState().courses.items).map(course => {
		return Object.values(course.lectures.items).flat();
	}).flat();

	const targets_phase2: IteratorItem[] = lectures.filter(lecturesByWeek => {
			// 저장된 강의 개수와 홈페이지에 등록된 강의 개수가 다르면 fetch
			return lecturesByWeek.count !== Object.values(lecturesByWeek.items).length;
		}).map(lecturesByWeek => ({
			title: `${courses.items[lecturesByWeek.courseId].name}`,
			subtitle: `${lecturesByWeek.id}주차 강의목록을 가져오는 중입니다`,
			action: actions.lectureByWeek(lecturesByWeek.courseId, lecturesByWeek.id)
		}));

	for(const item of targets_phase2) {
		yield item;
	}
}

export class CourseFetchIterator {

	iterator: ReturnType<typeof courseRefreshGenerator>

	constructor() {
		this.iterator = courseRefreshGenerator();
	}

	next(): IteratorResult<IteratorItem, void> {
		const next = this.iterator.next();
	
		return next;
	}
}

let courseRefreshIterator: CourseFetchIterator;

const tickInterval = 3 * 1000;

let timer: NodeJS.Timeout;

export const backgroundFetchIterator = {

	start: (): void => {
		if(timer) clearInterval(timer);

		timer = setInterval(backgroundFetchIterator.tick, tickInterval);
	},

	tick: (): void => {
		if(!courseRefreshIterator) courseRefreshIterator = new CourseFetchIterator();
	
		const next = courseRefreshIterator.next();
	
		if(next.value) store.dispatch(next.value.action.fetchIfExpired());
	
		if(next.done) courseRefreshIterator = new CourseFetchIterator();
	},

	stop: (): void => {
		if(timer) clearInterval(timer);
	}
};