import path from 'path';

export const defaultOptions: Electron.BrowserWindowConstructorOptions = {
	title: 'Door Desktop',
	icon: path.join(__dirname, 'icon/icon.png'),
	frame: false,
	show: false,
	center: true,
	autoHideMenuBar: true,
};
