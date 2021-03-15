/**
 * @description 네트워크 요청에 대한 응답 객체
 */
export interface Response<ResponseObject> {
	/**
	 * @description 주요 데이터
	 */
	data: ResponseObject;
	/**
	 * @description 성공 여부
	 */
	//success: boolean;
	/**
	 * @description 응답 코드
	 */
	//status: number;
	/**
	 * @description 응답 결과에 대한 텍스트
	 */
	//statusText: string;
}

export abstract class HttpError extends Error {
	static BAD_REQUEST = 400 as const;
	static UNAUTHORIZED = 401 as const;
	static NOT_ACCEPTABLE = 406 as const;

	abstract status: number;
}

export class BadRequestError extends HttpError {
	status = HttpError.BAD_REQUEST;

	constructor(message?: string) {
		super(message ?? '잘못된 요청입니다.');
	}
}

export class UnauthorizedError extends HttpError {
	status = HttpError.UNAUTHORIZED;

	constructor(message?: string) {
		super(message ?? '로그인이 되어있지 않아 접근할 수 없습니다.');
	}
}

export class NotAcceptableError extends HttpError {
	status = HttpError.NOT_ACCEPTABLE;

	constructor(message?: string) {
		super(message ?? '요청에 부합하는 응답을 할 수 없습니다.');
	}
}
