import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { defaultOptions } from './defaultOptions';

export const createSplashWindow = (options?: Electron.BrowserWindowConstructorOptions): BrowserWindow => {
	log.info('Create splash window ...');

	const window = new BrowserWindow({
		...defaultOptions,

		resizable: false,
		width: 560,
		height: 380,
		webPreferences: {
			preload: SPLASH_PRELOAD_WEBPACK_ENTRY,
		},

		...options,
	});

	window.loadURL(SPLASH_WEBPACK_ENTRY);

	return window;
};
