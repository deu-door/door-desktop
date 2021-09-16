import { persistStore, persistReducer } from 'redux-persist';
import { combineReducers, configureStore } from '@reduxjs/toolkit';
import createElectronStorage from 'redux-persist-electron-storage';
import { reducers } from '../common/modules';
import { IS_DEV } from '../common/constants';
import { forwardToRenderer, replayActionMain, triggerAlias } from 'electron-redux';
import { requestMetadataMiddleware } from '../common/request/request';
import { RequestMetadataResetPending } from './transforms/requestMetadataResetPending';
import { PersistCredential } from './transforms/persistCredential';
import { ResetOnVersionChange } from './migrates/resetOnVersionChange';

const rootReducer = combineReducers({
	user: persistReducer(
		{
			key: 'user',
			storage: createElectronStorage({ electronStoreOpts: { name: 'user' } }),
			version: 1,
			blacklist: ['sessionExpired'], // can't keep session when program restart
			transforms: [PersistCredential],
			migrate: ResetOnVersionChange,
		},
		reducers.user,
	),
	term: persistReducer(
		{
			key: 'term',
			storage: createElectronStorage({ electronStoreOpts: { name: 'term' } }),
			version: 1,
			migrate: ResetOnVersionChange,
		},
		reducers.term,
	),
	course: persistReducer(
		{
			key: 'course',
			storage: createElectronStorage({ electronStoreOpts: { name: 'course' } }),
			version: 1,
			migrate: ResetOnVersionChange,
		},
		reducers.course,
	),
	post: persistReducer(
		{
			key: 'post',
			storage: createElectronStorage({ electronStoreOpts: { name: 'post' } }),
			version: 1,
			migrate: ResetOnVersionChange,
		},
		reducers.post,
	),
	assignment: persistReducer(
		{
			key: 'assignment',
			storage: createElectronStorage({ electronStoreOpts: { name: 'assignment' } }),
			version: 1,
			migrate: ResetOnVersionChange,
		},
		reducers.assignment,
	),
	lecture: persistReducer(
		{
			key: 'lecture',
			storage: createElectronStorage({ electronStoreOpts: { name: 'lecture' } }),
			version: 1,
			migrate: ResetOnVersionChange,
		},
		reducers.lecture,
	),
	requestMetadata: persistReducer(
		{
			key: 'requestMetadata',
			storage: createElectronStorage({ electronStoreOpts: { name: 'requestMetadata' } }),
			version: 1,
			transforms: [RequestMetadataResetPending],
			migrate: ResetOnVersionChange,
		},
		reducers.requestMetadata,
	),
	// 다운로드 기록은 보존할 필요가 없음
	download: reducers.download,
	// 배치 액션 기록은 보존할 필요가 없음
	batchAction: reducers.batchAction,
});

// redux toolkit을 사용한 configure store.
// redux-thunk 및 redux devtools가 적용됨
export const store = configureStore({
	reducer: rootReducer,
	devTools: IS_DEV,
	middleware: getDefaultMiddleware =>
		getDefaultMiddleware({ serializableCheck: IS_DEV })
			.prepend(
				triggerAlias, // unwrap aliased action
			)
			.concat(
				requestMetadataMiddleware, // write reuqest metadata if action is ends with: one of /pending, /fulfilled or /rejected
				// createDefaultReduxLogger(), // redux-logger (disabled: console stucked when data being large)
				forwardToRenderer, // forward action to all renderer process
			),
});

replayActionMain(store);

export const persistor = persistStore(store);

export type RootState = ReturnType<typeof rootReducer>;
