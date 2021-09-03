import { app } from 'electron';

// When Squirrel installs your app it actually launches it a few times with some special arguments
// allowing you to do some work during installation or some clean up during uninstall.
// You can read more about these arguments on the Electron Windows Installer README.
//
// The easiest way to handle these arguments and stop your app launching multiple times during install
// is to use electron-squirrel-startup
//
// see https://www.electronforge.io/config/makers/squirrel.windows
if (require('electron-squirrel-startup')) app.quit();

require('./app');
