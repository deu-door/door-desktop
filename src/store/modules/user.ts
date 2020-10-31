import { handleActions } from 'redux-actions';
import door from 'service/door';
import { User } from 'service/door/interfaces/user';
import { LoginOptions } from 'service/door/user';
import { AsyncState, fetchableActions } from '.';

export interface UserState extends User, AsyncState { }

const initialState: UserState = {
	fulfilled: false,
	authenticated: false,
	pending: false
};

const userActions = fetchableActions<UserState, User, { id: string, password: string, options?: LoginOptions }>(
	'USER',
	draft => draft,
	({ id, password, options }) => door.login(id, password, options),
	{
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
);

export default handleActions<UserState, any>({
	...userActions.actions
}, initialState);

export const login = (id: string, password: string, options?: LoginOptions) => userActions.fetch({ id, password, options });
