import { app, BrowserWindow, session } from 'electron';
import * as isDev from 'electron-is-dev';
import * as path from 'path';
import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';

// Garbage Collection이 일어나지 않도록 함수 밖에 선언함.
let mainWindow: BrowserWindow;

// 크롬 확장프로그램 설치 함수
async function installExtensions(){
	for(const extension of [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]){
		try{
			const name = await installExtension(extension);
			console.log(`Extension "${name}" successfully installed.`);
		}catch(e){
			console.error(`Error while installing extension "${extension}".`, e);
		}
	}
}

app.commandLine.appendSwitch('disable-features', 'SameSiteByDefaultCookies');
app.commandLine.appendSwitch('disable-features', 'CookiesWithoutSameSiteMustBeSecure');

function configureSession(){
	const filter = { urls: ["http://*/*", "https://*/*"] };
	
	session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
		details.requestHeaders['Origin'] = null;
		// 교내 네트워크 사용 시 User-Agent 부분을 수정해야 넷클라이언트 설치 페이지가 뜨지 않음`
		// 크롬 정책 상 XHR에서 설정 불가.
		details.requestHeaders['User-Agent'] = 'Mozilla/5.0 (Linux; Android 6.0; Nexus 5 Build/MRA58N) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/86.0.4240.75 Mobile Safari/537.36';
		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});
	
	session.defaultSession.webRequest.onHeadersReceived(filter, (details, callback) => {
		const cookies = (details.responseHeaders['set-cookie'] || []).map(cookie => cookie.replace('SameSite=Lax', 'SameSite=None'));
		if(cookies.length > 0){
			details.responseHeaders['set-cookie'] = cookies;
		}

		callback({ cancel: false, responseHeaders: details.responseHeaders });
	});
}


async function createWindow() {
	configureSession();

	mainWindow = new BrowserWindow({
		center: true,
		kiosk: !isDev,
		resizable: true,
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
			enableRemoteModule: true
			//allowRunningInsecureContent: true
		}
	});

	if(isDev) {
		// 개발자 도구 (DevTools) 설치
		await installExtensions();

		// 개발 중에는 개발 도구에서 호스팅하는 주소에서 로드
		mainWindow.loadURL('http://localhost:3000');

		mainWindow.webContents.on('did-frame-finish-load', async () => {
			mainWindow.webContents.openDevTools();
		});
	}else{
		// 프로덕션 환경에서는 패키지 내부 리소스에 접근
		mainWindow.loadFile(path.join(__dirname, '../build/index.html'));
	}

	mainWindow.on('closed', () => {
		mainWindow = undefined!;
	});
}

app.on('ready', createWindow);

app.on('window-all-closed', () => {
	// OS X 에서는 프로그램을 닫았을 때 메뉴 바에 머물러 있는것이 일반적
	if(process.platform !== 'darwin') {
		app.quit();
	}
});

app.on('activate', () => {
	if(mainWindow === null) {
		createWindow();
	}
});
