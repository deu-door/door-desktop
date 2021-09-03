import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { IS_DEV } from '../../common/constants';
import { defaultOptions } from './defaultOptions';

export const createMainWindow = (options?: Electron.BrowserWindowConstructorOptions): BrowserWindow => {
	log.info('Create main window ...');

	const window = new BrowserWindow({
		...defaultOptions,

		resizable: true,
		width: 1120,
		height: 760,
		webPreferences: {
			preload: MAIN_PRELOAD_WEBPACK_ENTRY,
			nodeIntegration: true,
			contextIsolation: false,
			enableRemoteModule: true,
		},

		...options,
	});

	window.loadURL(MAIN_WEBPACK_ENTRY);

	// Installing react & redux devtools broke HMR (Hot Module Reloading)
	//
	// if (isDev) {
	// 	// 개발자 도구 (DevTools) 설치
	// 	installExtensions().then(() => {
	// 		// devtools 열기
	// 		window.webContents.on('did-frame-finish-load', async () => {
	// 			window.webContents.openDevTools();
	// 		});
	// 	});
	// }

	if (IS_DEV) {
		window.webContents.on('did-frame-finish-load', async () => {
			window.webContents.openDevTools();
		});
	}

	return window;
};
