import { app, BrowserWindow, session } from 'electron';
import { createSplashWindow } from './windows/splash';
import { createMainWindow } from './windows/main';
import { SessionWatchTower } from './helper/sessionWatchTower';
import door from '../common/door';
import log from 'electron-log';
import './debug';
import { supportDoorSession } from './helper/supportDoorSession';

// Garbage Collection이 일어나지 않도록 함수 밖에 선언함.
let mainWindow: BrowserWindow;
let sessionWatchTower: SessionWatchTower;

const gotTheLock = app.requestSingleInstanceLock();

// 창이 여러개 띄워지는 것을 방지
if (!gotTheLock) {
	app.quit();
} else {
	// 두 번째 창을 띄우려고 시도하는 경우, 대신 기존에 있던 창을 띄움
	app.on('second-instance', (event, commandLine, workingDirectory) => {
		if (mainWindow) {
			if (mainWindow.isMinimized()) mainWindow.restore();
			mainWindow.focus();
		}
	});

	app.on('ready', async () => {
		log.info('App is running on ' + __dirname);

		const splashWindow = createSplashWindow();
		splashWindow.on('ready-to-show', () => {
			splashWindow.show();
			splashWindow.focus();
		});

		// synchronize headers between axios (http.Agent) & session (Electron.Session)
		supportDoorSession(session.defaultSession);

		// watch session authorization state,
		// if session expired, try to login with saved credential
		sessionWatchTower = new SessionWatchTower(door);

		// do login
		const waitForLogin = sessionWatchTower.tryLoginWithSavedCredential();
		const waitForSplashAtLeast = new Promise(resolve => setTimeout(resolve, 2000)); // wait for 2 seconds at least

		// create main window early
		mainWindow = createMainWindow();

		// when main window ready to show, promise resolved.
		const waitForMainWindowReady = new Promise<void>(resolve => mainWindow.once('ready-to-show', () => resolve()));

		await Promise.all([waitForLogin, waitForSplashAtLeast]);

		// main window ready? not ready yet, wait
		await waitForMainWindowReady;

		splashWindow.destroy();

		mainWindow.show();
		mainWindow.focus();

		mainWindow.on('closed', () => {
			// eslint-disable-next-line @typescript-eslint/no-non-null-assertion
			mainWindow = undefined!;

			app.releaseSingleInstanceLock();
		});

		// check for update
		//checkForUpdates();
	});
}

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on('window-all-closed', () => {
	if (process.platform !== 'darwin') app.quit();
});

app.on('activate', () => {
	// On OS X it's common to re-create a window in the app when the
	// dock icon is clicked and there are no other windows open.
	if (mainWindow === undefined /* && BrowserWindow.getAllWindows().length === 0 */) {
		mainWindow = createMainWindow();
	}
});
