import door from '../../common/door';

const urls = ['*://*.deu.ac.kr/*'];

/**
 * {@link Door} 클라이언트의 쿠키 및 헤더 값을 Electron.Session 에서도 사용할 수 있도록 해주는 함수
 *
 * @param session 적용할 {@link Electron.Session}
 */
export function supportDoorSession(session: Electron.Session): Electron.Session {
	/**
	 * Electron.Session을 통한 http 요청에 대해 Headers를 추가함
	 */
	session.webRequest.onBeforeSendHeaders({ urls }, (details, callback) => {
		// http agent로 사용되는 axios의 headers를 가져와 Electron.Session 에 적용
		Object.assign(details.requestHeaders, door.getHeaders());

		callback({ cancel: false, requestHeaders: details.requestHeaders });
	});

	/**
	 * Electron.Session을 통해 http 반환을 받을 때 headers를 조작함
	 */
	session.webRequest.onHeadersReceived({ urls }, (details, callback) => {
		const headers = Object.fromEntries(
			Object.entries(details.responseHeaders ?? {})
				.filter(([header]) => {
					// X-Frame-Options 비활성화. Door 컨텐츠를 iframe으로 띄우기 위함임
					if (header.toLowerCase() === 'x-frame-options') return false;

					return true;
				})
				.map(([header, value]) => {
					// SameSite=Lax 쿠키 정책 해제
					if (header.toLowerCase() === 'set-cookie') {
						return [header, value.map(cookie => cookie.replace('SameSite=Lax', 'SameSite=None'))];
					}
					// Content-Security-Policy 정책 해제
					else if (header.toLowerCase() === 'content-security-policy') {
						return [header, ['*']];
					}

					return [header, value];
				}),
		);

		callback({ cancel: false, responseHeaders: headers });
	});

	return session;
}
