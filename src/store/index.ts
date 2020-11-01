import { createStore, applyMiddleware, combineReducers, compose } from 'redux';
import thunk from 'redux-thunk';
import createElectronStorage from 'redux-persist-electron-storage';
import { persistReducer, persistStore } from 'redux-persist';
import modules from './modules';

const persistConfig = {
	key: 'root',
	storage: createElectronStorage()
};

// Redux Thunk 미들웨어 사용
const middlewares = [thunk];

// Redux Devtools 사용
const composeEnhancers = (window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// 미들웨어 적용
const enhancer = composeEnhancers(applyMiddleware(...middlewares));

// moduels import한 후 combine
const rootReducer = combineReducers(modules);

export type RootState = ReturnType<typeof rootReducer>;

// Reducer 저장
const persistedReducer = persistReducer(persistConfig, rootReducer);

// Redux Store 생성
export const store = createStore(persistedReducer, enhancer);

// Redux Store 영구 저장 persistor 생성
export const persistor = persistStore(store);
