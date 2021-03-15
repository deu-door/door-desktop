import { persistStore } from 'redux-persist';
import { rootReducer } from './modules';
import { configureStore, getDefaultMiddleware } from '@reduxjs/toolkit';

// redux toolkit을 사용한 configure store.
// redux-thunk 및 redux devtools가 적용됨
export const store = configureStore({
	reducer: rootReducer,
	devTools: process.env.NODE_ENV !== 'production',
	middleware: getDefaultMiddleware({
		serializableCheck: false,
	}),
});

// Redux Store 영구 저장 persistor 생성
export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;

export { actions } from './modules';
