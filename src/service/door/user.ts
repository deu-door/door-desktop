import cheerio from 'cheerio';
import { secure } from 'service/secure';
import { doorAxios } from ".";
import { fulfilledFetchable } from './interfaces';
import { Profile, User } from './interfaces/user';

export type LoginOptions = { saveCredential: boolean };

/**
 * @description Door 홈페이지에 로그인을 시도합니다.
 * 
 * @param id Door 홈페이지에서 사용하는 ID
 * @param password Door 홈페이지에서 사용하는 패스워드.
 * @param options 
 */
export async function login(id: string, password: string, options?: LoginOptions): Promise<User> {
	try{
		// alreay logined?
		return {
			authenticated: true,
			profile: await getProfile(),

			...fulfilledFetchable()
		}
	}catch(e){
		// Login required. continue
	}

	await doorAxios.get('/');

	await doorAxios.get('https://door.deu.ac.kr/sso/login.aspx');

	const loginForm = {
		issacweb_data: '',
		challenge: '',
		response: '',
		id: id,
		pw: password,
		LoginID: id,
		LoginPW: password
	};

	const response1 = await doorAxios.post('https://door.deu.ac.kr/Account/LoginDEU', loginForm);

	const expectedResponse1: { [key: string]: string|number } = { Code: 1000, Msg: 'OK', Obj: 0 };
	if(Object.keys(expectedResponse1).some(key => expectedResponse1[key] !== response1.data[key])){
		throw new Error('Unexpected result received while processing login');
	}
	
	//const loginResult = cheerio.load((await door.post('https://sso.deu.ac.kr/LoginServlet?method=idpwProcessEx&ssid=30', loginForm)).data);
	//const token = loginResult(`*[name=secureToken]`).attr('value');
	//const sessionId = loginResult(`*[name=secureSessionId]`).attr('value');

	const loginResult = cheerio.load((await doorAxios.post('https://sso.deu.ac.kr/LoginServlet?method=idpwProcessEx&ssid=30', loginForm)).data);
	// const token = /name="secureToken" value="(.*)"/.exec(response2.data)?.[1];
	// const sessionId = /name="secureSessionId" value="(.*)"/.exec(response2.data)?.[1];
	const token = loginResult('input[name=secureToken]').attr('value');
	const sessionId = loginResult('input[name=secureSessionId]').attr('value');
	const incorrectCount = loginResult('input[name=incorrectCount]').attr('value');

	console.log(token, sessionId);

	if(!token || !sessionId) {
		// login failed
		throw new Error('로그인에 실패하였습니다. 아이디와 패스워드를 확인해주세요.' + (isNaN(Number(incorrectCount)) ? '' : ' 누적 실패 횟수: ' + incorrectCount));
	}

	const tokenForm = {
		secureToken: token,
		secureSessionId: sessionId
	};

	await doorAxios.post('https://door.deu.ac.kr/sso/business.aspx', {
		...tokenForm,
		isToken: 'Y',
		reTry: 'N',
		method: 'checkToken',
		incorrectCount: 0
	});

	await doorAxios.post('https://door.deu.ac.kr/sso/checkauth.aspx', {
		...tokenForm,
		isToken: 'Y'
	});

	await doorAxios.post('http://sso.deu.ac.kr/LoginServlet', {
		...tokenForm,
		method: 'updateSecureToken',
		ssid: 30
	});
	
	await doorAxios.post('https://door.deu.ac.kr/sso/agentProc.aspx', {
		method: 'auth'
	});

	await doorAxios.post('https://door.deu.ac.kr/Account/SSOLogOnProcess', {
		ssoUid: id,
		returnURL: '/'
	});

	const user = {
		authenticated: true,
		profile: await getProfile(),

		...fulfilledFetchable()
	};

	if(options && options.saveCredential){
		secure.save(id, password);
	}

	return user;
}

export async function logout(): Promise<void> {
	try{
		// check user logined
		const profile = await getProfile();

		secure.remove(profile.id);
	}catch(e){
		// Not logined, quit
		return;
	}

	// GET http://door.deu.ac.kr/Account/LogOff
	// --> 302 REDIRECT https://door.deu.ac.kr/Account/LogOff
	// --> 302 REDIRECT https://door.deu.ac.kr/sso/logout.aspx
	await doorAxios.get('https://door.deu.ac.kr/sso/logout.aspx');

	await doorAxios.post('http://sso.deu.ac.kr/isignplus/logout.jsp', { ssid: 30, domain: '' });

	await doorAxios.post('http://sso.deu.ac.kr/LoginServlet', { ssid: 30, secureSessionId: '', method: 'logout' });

	await doorAxios.post('https://door.deu.ac.kr/sso/business.aspx', {
		secureToken: '', secureSessionId: '', isToken: 'N', reTry: 'Y', method: 'checkToken', incorrectCount: 0
	});
}

export async function getProfile(): Promise<Profile> {
	const response = await doorAxios.get('https://door.deu.ac.kr/Mypage/MyInfo');
	const document = cheerio.load(response.data);

	const table = document(`#sub_content2 > div:nth-child(2) > table > tbody > tr > td:nth-child(3) > div.form_table > table`);

	if(table.length === 0){
		throw new Error('로그인 상태를 확인해주세요.');
	}

	const id = document(`tbody > tr:nth-child(2) > td:nth-child(4)`, table).text();
	const name = document(`tbody > tr:nth-child(2) > td:nth-child(2)`, table).text();
	const type = document(`tbody > tr:nth-child(1) > td:nth-child(2)`, table).text();
	const major = document(`tbody > tr:nth-child(1) > td:nth-child(4)`, table).text();

	return { id, name, type, major, ...fulfilledFetchable() };
}
