import { Course } from "service/door/interfaces/course";
import { store } from "store";
import { actions, FetchableAction } from "./modules";

const courseRefreshGenerator = function *(courses: Course[]) {
	const targets = [
		actions.courses(),
		...courses.map(course => actions.notices(course.id)),
		...courses.map(course => actions.lectures(course.id)),
		...courses.map(course => actions.assignments(course.id))
	];

	for(const action of targets) {
		yield action;
	}
}

let courseRefreshIterator: Generator<FetchableAction, void, unknown>;

const tickInterval = 3 * 1000;

let timer: NodeJS.Timeout;

export const service = {
	start: () => {
		if(timer) clearInterval(timer);

		timer = setInterval(service.tick, tickInterval);
	},

	tick: () => {
		const courses = Object.values(store.getState().courses.items);
	
		if(!courseRefreshIterator) courseRefreshIterator = courseRefreshGenerator(courses);
	
		const next = courseRefreshIterator.next();
	
		if(next.value) {
			store.dispatch(next.value.fetchIfExpired());
		}
	
		if(next.done) courseRefreshIterator = courseRefreshGenerator(courses);
	},

	stop: () => {
		if(timer) clearInterval(timer);
	}
};