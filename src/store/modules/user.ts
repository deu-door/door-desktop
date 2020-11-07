import { AnyAction } from 'redux';
import { handleActions } from 'redux-actions';
import { createTransform, persistReducer } from 'redux-persist';
import door from 'service/door';
import { User } from 'service/door/interfaces/user';
import { LoginOptions } from 'service/door/user';
import { storage } from 'store/storage';
import { FetchableAction } from '.';
import { AsyncState, fetchableActions, FetchableTransform, ResetOnVersionChange } from './util';

export interface UserState extends User, AsyncState { }

const initialState: UserState = {
	fulfilled: false,
	authenticated: false,
	pending: false
};

const loginActions = fetchableActions<UserState, User, { id: string, password: string, options?: LoginOptions }>({
	name: 'USER_LOGIN',
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
		},
		clear: (action, draft) => {
			draft.authenticated = false;
		}
	}
});

const logoutActions = fetchableActions<UserState, User, void>({
	name: 'USER_LOGOUT',
	selector: state => state.user,
	path: draft => draft,
	fetch: () => door.logout(),
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
			draft.authenticated = false;
		}
	}
})

const AuthenticatedTransform = createTransform(
	(inboundState, key) => {
		if(key === 'authenticated') return false;
		if(key === 'error') return undefined;

		return inboundState;
	},
	(outboundState, key) => {
		if(key === 'authenticated') return false;
		if(key === 'error') return undefined;
		
		return outboundState;
	}
)

export default persistReducer(
	{
		key: 'user',
		storage: storage,
		transforms: [FetchableTransform, AuthenticatedTransform],
		version: 1,
		migrate: ResetOnVersionChange()
	},
	handleActions<UserState, any>({
		...loginActions.reduxActions,
		...logoutActions.reduxActions
	}, initialState)
);

export const actions = {
	login: (id: string, password: string, options?: LoginOptions): FetchableAction => loginActions.actions({ id, password, options }),

	logout: (): FetchableAction => logoutActions.actions()
};
