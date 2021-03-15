import createElectronStorage from 'redux-persist-electron-storage';
import { Storage } from 'redux-persist/es/types';

const stor = createElectronStorage();

export const persistedStorage: Storage = stor;
