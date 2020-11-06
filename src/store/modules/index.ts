import { storage } from 'store/storage';
import user, { actions as userActions } from './user';
import courses, { actions as courseActions } from './courses';
import { combineReducers } from 'redux';
import { persistReducer } from 'redux-persist';

export interface FetchableAction {
	fetch: () => any,
	fetchIfExpired: () => any,
	fetchIfNotFulfilled: () => any,
	clear: () => any
}

const modules = { user, courses };

const persistConfig = {
	key: 'root',
	storage: storage
};

export type RootState = ReturnType<typeof rootReducer>;

// export const rootReducer = persistReducer(persistConfig, combineReducers(modules));

export const rootReducer = combineReducers(modules);

export const actions = {
	...userActions,
	...courseActions
}