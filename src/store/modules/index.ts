import { combineReducers } from 'redux';

import { reducer as userReducer } from './user';
import { reducer as termsReducer } from './terms';
import { reducer as coursesReducer } from './courses';
import { reducer as postsReducer } from './posts';
import { reducer as lecturesReducer } from './lectures';
import { reducer as onlineResourcesReducer } from './online-resources';

import { actions as userActions } from './user';
import { actions as termsActions } from './terms';
import { actions as coursesActions } from './courses';
import { actions as postsActions } from './posts';
import { actions as lecturesActions } from './lectures';
import { actions as onlineResourcesActions } from './online-resources';

import { selectors as termsSelectors } from './terms';
import { selectors as coursesSelectors } from './courses';
import { selectors as postsSelectors } from './posts';
import { selectors as lecturesSelectors } from './lectures';

export const rootReducer = combineReducers({
	user: userReducer,
	terms: termsReducer,
	courses: coursesReducer,
	posts: postsReducer,
	lectures: lecturesReducer,
	onlineResources: onlineResourcesReducer,
});

export const actions = {
	...userActions,
	...termsActions,
	...coursesActions,
	...postsActions,
	...lecturesActions,
	...onlineResourcesActions,
};

export const selectors = {
	...termsSelectors,
	...coursesSelectors,
	...postsSelectors,
	...lecturesSelectors,
};
