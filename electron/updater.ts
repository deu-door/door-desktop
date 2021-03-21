import { autoUpdater } from 'electron-updater';
import log from 'electron-log';

export const checkForUpdates = (): void => {
	log.transports.file.level = 'debug';

	autoUpdater.logger = log;
	autoUpdater.fullChangelog = true;
	autoUpdater.checkForUpdatesAndNotify();
};
