import {
	createStore,
	applyMiddleware,
	compose,
	Action,
	AnyAction,
	Store,
	Reducer,
} from 'redux';
import thunk from 'redux-thunk';
import { persistStore } from 'redux-persist';
import { rootReducer, RootState } from './modules';

// Redux Thunk 미들웨어 사용
const middlewares = [thunk];

// Redux Devtools 사용
const composeEnhancers =
	(window as any).__REDUX_DEVTOOLS_EXTENSION_COMPOSE__ || compose;

// 미들웨어 적용
const enhancer = composeEnhancers(applyMiddleware(...middlewares));

// Redux Store 생성
export const store = createStore(
	rootReducer as Reducer<RootState, AnyAction>,
	enhancer,
);

// Redux Store 영구 저장 persistor 생성
export const persistor = persistStore(store);
