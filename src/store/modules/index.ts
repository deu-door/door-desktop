import { storage } from 'store/storage';
import user, { actions as userActions } from './user';
import courses, { actions as courseActions } from './courses';
import chat, { actions as chatActions } from './chat';
import { combineReducers } from 'redux';

export interface FetchableAction {
	fetch: () => any,
	fetchIfExpired: () => any,
	fetchIfNotFulfilled: () => any,
	clear: () => any
}

const modules = { user, courses, chat };

export type RootState = ReturnType<typeof rootReducer>;

// export const rootReducer = persistReducer(persistConfig, combineReducers(modules));

export const rootReducer = combineReducers(modules);

export const actions = {
	...userActions,
	...courseActions,
	...chatActions
}