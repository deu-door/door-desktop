import { combineReducers, configureStore } from '@reduxjs/toolkit';
import { IS_DEV } from '../common/constants';
import { reducers } from '../common/modules';
import { forwardToMain, getInitialStateRenderer, replayActionRenderer } from 'electron-redux';
import { useSelector as useReduxSelector, TypedUseSelectorHook } from 'react-redux';
import { createDefaultReduxLogger } from '../common/helper/createDefaultReduxLogger';

const rootReducer = combineReducers(reducers);

// redux toolkit을 사용한 configure store.
// redux-thunk 및 redux devtools가 적용됨
export const store = configureStore({
	reducer: rootReducer,
	devTools: IS_DEV,
	// fork state from main process
	preloadedState: getInitialStateRenderer(),
	middleware: getDefaultMiddleware => {
		const middlewares = getDefaultMiddleware({ serializableCheck: IS_DEV });

		if (IS_DEV) middlewares.prepend(createDefaultReduxLogger()); // redux-logger

		return middlewares.prepend(forwardToMain); // this must be last (forward action to main process)
	},
});

replayActionRenderer(store);

export type RootState = ReturnType<typeof rootReducer>;

export const useSelector: TypedUseSelectorHook<RootState> = useReduxSelector;
