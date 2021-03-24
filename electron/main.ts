import { app, BrowserWindow, session } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import unusedFilename from 'unused-filename';
import { checkForUpdates } from './updater';

// Garbage Collection이 일어나지 않도록 함수 밖에 선언함.
let mainWindow: BrowserWindow;

// 크롬 확장프로그램 설치 함수
async function installExtensions() {
	for (const extension of [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]) {
		try {
			const name = await installExtension(extension);
			console.log(`Extension "${name}" successfully installed.`);
		} catch (e) {
			console.error(`Error while installing extension "${extension}".`, e);
		}
	}
}

app.commandLine.appendSwitch('disable-features', 'SameSiteByDefaultCookies');
app.commandLine.appendSwitch('disable-features', 'CookiesWithoutSameSiteMustBeSecure');

function configureSession() {
	session.defaultSession.webRequest.onBeforeSendHeaders(
		{
			urls: ['*://deu.ac.kr/*', '*://*.deu.ac.kr/*'],
		},
		(details, callback) => {
			details.requestHeaders['Origin'] = '';
			// 교내 네트워크 사용 시 User-Agent 부분을 수정해야 넷클라이언트 설치 페이지가 뜨지 않음`
			// 크롬 정책 상 XHR에서 설정 불가.
			details.requestHeaders['User-Agent'] =
				'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36';

			callback({ cancel: false, requestHeaders: details.requestHeaders });
		},
	);

	session.defaultSession.webRequest.onHeadersReceived(
		{
			urls: ['*://*/*'],
		},
		(details, callback) => {
			const headers = details.responseHeaders;
			details.responseHeaders = {};

			Object.keys(headers).forEach(header => {
				// X-Frame-Options 비활성화. Door 컨텐츠를 iframe으로 띄우기 위함임
				if (header.toLowerCase() === 'x-frame-options') return;

				// SameSite=Lax 쿠키 정책 해제
				if (header.toLowerCase() === 'set-cookie') {
					return (details.responseHeaders[header] = headers[header].map(cookie =>
						cookie.replace('SameSite=Lax', 'SameSite=None'),
					));
				}

				details.responseHeaders[header] = headers[header];
			});

			callback({ cancel: false, responseHeaders: details.responseHeaders });
		},
	);
}

function configureDownload() {
	session.defaultSession.on('will-download', (event, item, webContents) => {
		const filepath = unusedFilename.sync(path.join(app.getPath('downloads'), item.getFilename()));

		item.setSavePath(filepath);
	});
}

async function createWindow() {
	configureSession();
	configureDownload();

	console.log('main.ts is running on ' + __dirname);

	mainWindow = new BrowserWindow({
		title: 'Door Desktop',
		titleBarStyle: 'hidden',
		frame: false,

		center: true,
		// kiosk: !isDev,
		resizable: true,
		width: 1120,
		height: 760,
		icon: path.join(__dirname, '../favicon.ico'),
		webPreferences: {
			//preload: path.join(__dirname, 'preload.js'),
			// 웹 앱을 데스크탑으로 모양만 바꾼다면 false
			// Node 환경처럼 사용하려면 (Node 빌트 인 패키지 등) true
			nodeIntegration: true,
			//contextIsolation: true,
			//nodeIntegrationInWorker: true,
			// Cross Origin Request Policy 비활성화
			webSecurity: false,
			// electron-storage 사용하기 위해 true 설정
			enableRemoteModule: true,
			//allowRunningInsecureContent: true
			// <webview> 태그 사용을 위해 true 설정
			webviewTag: true,
		},
	});

	if (isDev) {
		// 개발자 도구 (DevTools) 설치
		await installExtensions();

		// 개발 중에는 개발 도구에서 호스팅하는 주소에서 로드
		mainWindow.loadURL('http://localhost:3000');

		mainWindow.webContents.on('did-frame-finish-load', async () => {
			mainWindow.webContents.openDevTools();
		});
	} else {
		// 프로덕션 환경에서는 패키지 내부 리소스에 접근
		// build/index.html
		mainWindow.loadURL(`file://${__dirname}/../index.html`);
	}

	// check for update
	checkForUpdates();

	mainWindow.on('closed', () => {
		mainWindow = undefined!;
	});
}

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

	app.on('ready', createWindow);

	app.on('activate', () => {
		if (mainWindow === null) {
			createWindow();
		}
	});

	// 모든 창에 대해 메뉴 바 제거
	if (!isDev)
		app.on('browser-window-created', (event, window) => {
			window.removeMenu();
		});
}

app.on('window-all-closed', () => {
	// OS X 에서는 프로그램을 닫았을 때 메뉴 바에 머물러 있는것이 일반적
	if (process.platform !== 'darwin') {
		app.quit();
	}
});
