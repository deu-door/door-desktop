import { IUser } from 'models/door';
import { BadRequestError, NotAcceptableError, Response, UnauthorizedError } from 'services/response';
import { driver, parse } from './util';

/**
 * @description Door 홈페이지에 로그인을 시도합니다.
 *
 * @param id Door 홈페이지에서 사용하는 ID
 * @param password Door 홈페이지에서 사용하는 패스워드.
 *
 * @throws {HttpError}
 */
export async function login(id: string, password: string): Promise<Response<IUser>> {
	try {
		// alreay logined?
		return await getUser();
	} catch (e) {
		// Login required. continue
	}

	await driver.get('/');

	await driver.get('https://door.deu.ac.kr/sso/login.aspx');

	const loginForm = {
		issacweb_data: '',
		challenge: '',
		response: '',
		id: id,
		pw: password,
		LoginID: id,
		LoginPW: password,
	};

	const response1 = await driver.post('https://door.deu.ac.kr/Account/LoginDEU', loginForm);

	const expectedResponse1: { [key: string]: string | number } = {
		Code: 1000,
		Msg: 'OK',
		Obj: 0,
	};
	if (Object.keys(expectedResponse1).some(key => expectedResponse1[key] !== response1.data[key])) {
		throw new BadRequestError('Unexpected result received while processing login');
	}

	//const loginResult = cheerio.load((await door.post('https://sso.deu.ac.kr/LoginServlet?method=idpwProcessEx&ssid=30', loginForm)).data);
	//const token = loginResult(`*[name=secureToken]`).attr('value');
	//const sessionId = loginResult(`*[name=secureSessionId]`).attr('value');

	const loginResult = parse((await driver.post('https://sso.deu.ac.kr/LoginServlet?method=idpwProcessEx&ssid=30', loginForm)).data);
	// const token = /name="secureToken" value="(.*)"/.exec(response2.data)?.[1];
	// const sessionId = /name="secureSessionId" value="(.*)"/.exec(response2.data)?.[1];
	const token = loginResult.querySelector('input[name=secureToken]')?.getAttribute('value') || undefined;
	const sessionId = loginResult.querySelector('input[name=secureSessionId]')?.getAttribute('value') || undefined;
	const incorrectCount = loginResult.querySelector('input[name=incorrectCount]')?.getAttribute('value') || undefined;

	console.log(token, sessionId);

	// check login failed
	if (token === undefined || sessionId === undefined)
		throw new NotAcceptableError(
			'로그인에 실패하였습니다. 아이디와 패스워드를 확인해주세요.' +
				(isNaN(Number(incorrectCount)) ? '' : ' 누적 실패 횟수: ' + incorrectCount),
		);

	const tokenForm = {
		secureToken: token,
		secureSessionId: sessionId,
	};

	await driver.post('https://door.deu.ac.kr/sso/business.aspx', {
		...tokenForm,
		isToken: 'Y',
		reTry: 'N',
		method: 'checkToken',
		incorrectCount: 0,
	});

	await driver.post('https://door.deu.ac.kr/sso/checkauth.aspx', {
		...tokenForm,
		isToken: 'Y',
	});

	await driver.post('http://sso.deu.ac.kr/LoginServlet', {
		...tokenForm,
		method: 'updateSecureToken',
		ssid: 30,
	});

	await driver.post('https://door.deu.ac.kr/sso/agentProc.aspx', {
		method: 'auth',
	});

	await driver.post('https://door.deu.ac.kr/Account/SSOLogOnProcess', {
		ssoUid: id,
		returnURL: '/',
	});

	return await getUser();
}

/**
 * @description Door 홈페이지에서 로그아웃합니다.
 */
export async function logout(): Promise<void> {
	try {
		// check user logined
		await getUser();
	} catch (e) {
		// Not logined, quit
		return;
	}

	// GET http://door.deu.ac.kr/Account/LogOff
	// --> 302 REDIRECT https://door.deu.ac.kr/Account/LogOff
	// --> 302 REDIRECT https://door.deu.ac.kr/sso/logout.aspx
	await driver.get('https://door.deu.ac.kr/sso/logout.aspx');

	await driver.post('http://sso.deu.ac.kr/isignplus/logout.jsp', {
		ssid: 30,
		domain: '',
	});

	await driver.post('http://sso.deu.ac.kr/LoginServlet', {
		ssid: 30,
		secureSessionId: '',
		method: 'logout',
	});

	await driver.post('https://door.deu.ac.kr/sso/business.aspx', {
		secureToken: '',
		secureSessionId: '',
		isToken: 'N',
		reTry: 'Y',
		method: 'checkToken',
		incorrectCount: 0,
	});
}

export async function getUser(): Promise<Response<IUser>> {
	const document = parse((await driver.get('https://door.deu.ac.kr/Mypage/MyInfo')).data);

	const table = document.querySelector(
		'#sub_content2 > div:nth-child(2) > table > tbody > tr > td:nth-child(3) > div.form_table > table',
	);

	if (!(table instanceof HTMLTableElement)) throw new UnauthorizedError('로그인 상태를 확인해주세요.');

	const id = table.querySelector<HTMLElement>(`tbody > tr:nth-child(2) > td:nth-child(4)`)?.innerText.trim();
	const name = table.querySelector<HTMLElement>(`tbody > tr:nth-child(2) > td:nth-child(2)`)?.innerText.trim();
	const type = table.querySelector<HTMLElement>(`tbody > tr:nth-child(1) > td:nth-child(2)`)?.innerText.trim();
	const major = table.querySelector<HTMLElement>(`tbody > tr:nth-child(1) > td:nth-child(4)`)?.innerText.trim();

	if (id === undefined || name === undefined || type === undefined || major === undefined)
		throw new UnauthorizedError('로그인 상태를 확인해주세요. (-1)');

	// 서버 측에서 세션 ID를 인식하여 사용자에 맞는 이미지를 전송하게끔 되어있음
	const image = 'https://door.deu.ac.kr/Mypage/UserImage';

	return {
		data: { id, name, type, major, image },
	};
}
