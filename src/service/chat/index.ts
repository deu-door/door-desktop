import axios from 'axios';

/**
 * Axios 객체. door 홈페이지 요청에 대해 맞춤 설정되어 있음
 */
export const chatAxios = axios.create({
	baseURL: 'http://door.p-e.kr',
	headers: {
		
	}
});

// Logging request
chatAxios.interceptors.request.use(request => {
	console.log('[Chat] Starting Request', request);
	return request;
});

// Logging response
chatAxios.interceptors.response.use(response => {
	console.log('[Chat] Receive Response', response);
	return response;
});