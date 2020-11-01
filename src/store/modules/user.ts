import { handleActions } from 'redux-actions';
import door from 'service/door';
import { User } from 'service/door/interfaces/user';
import { LoginOptions } from 'service/door/user';
import { AsyncState, fetchableActions } from './util';

export interface UserState extends User, AsyncState { }

const initialState: UserState = {
	fulfilled: false,
	authenticated: false,
	pending: false
};

const userActions = fetchableActions<UserState, User, { id: string, password: string, options?: LoginOptions }>({
	name: 'USER',
	selector: state => state.user,
	path: draft => draft,
	fetch: ({ id, password, options }) => door.login(id, password, options),
	handler: {
		pending: (action, draft) => {
			draft.authenticated = false;
			draft.profile = undefined;
		},
		failure: (action, draft) => {
			draft.authenticated = false;
			draft.profile = undefined;
		},
		success: (action, draft) => {
			draft.authenticated = true;
		}
	}
});

export default handleActions<UserState, any>({
	...userActions.actions
}, initialState);

export const actions = {
	login: (id: string, password: string, options?: LoginOptions) => ({
		fetch: () => userActions.fetch({ id, password, options }),
		timeout: () => userActions.timeout({ id, password, options })
	})
};
