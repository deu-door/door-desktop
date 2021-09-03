import { Lecture } from 'door-api';
import { BrowserWindow } from 'electron';
import log from 'electron-log';
import { defaultOptions } from './defaultOptions';

export const createLectureWindow = (lecture: Lecture, options?: Electron.BrowserWindowConstructorOptions): BrowserWindow => {
	log.info('Create lecture window ...');

	const window = new BrowserWindow({
		...defaultOptions,

		frame: true,
		show: true,
		center: false,
		webPreferences: {
			preload: LECTURE_PRELOAD_WEBPACK_ENTRY,
			webviewTag: true,
		},
	});

	// lecture object will serialized and put to url.
	window.loadURL(LECTURE_WEBPACK_ENTRY + `?serializedLecture=${encodeURIComponent(JSON.stringify(lecture))}`);

	return window;
};
