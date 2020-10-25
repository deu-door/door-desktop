import { handleActions } from 'redux-actions';
import door from 'service/door';
import { User } from 'service/door/interfaces/user';
import { setPasswordSecurely } from 'service/door/user';
import { AsyncState, fetchableActions } from '.';

export interface UserState extends User, AsyncState { }

const initialState: UserState = {
	fulfilled: false,
	authenticated: false,
	pending: false
};

const userActions = fetchableActions<UserState, User, { id: string, password: string }>(
	'USER',
	draft => draft,
	({ id, password }) => door.login(id, password),
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

			setPasswordSecurely(action.payload.params.id, action.payload.params.password);
		}
	}
);

export default handleActions<UserState, any>({
	...userActions.actions
}, initialState);

export const login = (id: string, password: string) => userActions.fetch({ id, password });
