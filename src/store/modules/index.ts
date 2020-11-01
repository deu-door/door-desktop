import user, { actions as userActions } from './user';
import courses, { actions as courseActions } from './courses';

export interface FetchableAction {
	fetch: () => any,
	fetchIfExpired: () => any,
	timeout: () => any
}

const modules = { user, courses };

export default modules;

export const actions = {
	...userActions,
	...courseActions
}