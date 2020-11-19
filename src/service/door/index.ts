import axios from 'axios';
import qs from 'qs';
import cheerio from 'cheerio';

import * as course from './course';
import * as notice from './notice';
import * as lecture from './lecture';
import * as assignment from './assignment';
import * as reference from './reference';
import * as activity from './activity';
import * as teamProject from './team-project';
import * as user from './user';

/**
 * Axios 객체. door 홈페이지 요청에 대해 맞춤 설정되어 있음
 */
export const doorAxios = axios.create({
	baseURL: 'http://door.deu.ac.kr',
	headers: {
		// 기본 Accept 헤더는 application/json, text/plain, */* 이렇게 되어있는데
		// 기본 값으로 사용시 서버 측에서 500 Internal 에러 발생
		// IMPORTANT: Accept 헤더는 반드시 */* 로 해야됨
		'Accept': '*/*',
		// 서버 측에선 application/x-www-form-urlencoded 외엔 인식하지 못함
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	transformRequest: [
		(data, headers) => qs.stringify(data, { arrayFormat: 'brackets' })
	],
	withCredentials: true,
	validateStatus: status => status >= 200 && status <= 302
});

// Logging request
doorAxios.interceptors.request.use(request => {
	console.log('[Axios] Starting Request', request);
	return request;
});

// Logging response
doorAxios.interceptors.response.use(response => {
	console.log('[Axios] Receive Response', response);
	return response;
});

// delayed all request (0.8s)
// doorAxios.interceptors.request.use(async request => {
// 	await new Promise(resolve => setTimeout(() => resolve(), 100));
// 	return request;
// });

export default {
	...course,
	...notice,
	...lecture,
	...assignment,
	...reference,
	...activity,
	...teamProject,
	...user
};
