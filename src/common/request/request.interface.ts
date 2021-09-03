import { Action } from '@reduxjs/toolkit';

/**
 * AJAX 요청 관련 정보들
 */
export type RequestMetadata = {
	/**
	 * 대상의 URI
	 */
	readonly uri: string;
	/**
	 * fetch를 성공한 시간. 한번도 성공한 적이 없다면 undefined
	 */
	fulfilledAt: string | undefined;
	/**
	 * 데이터를 불러오는 중인지 여부
	 */
	pending: boolean;
	/**
	 * 데이터가 있는지 여부
	 */
	fulfilled: boolean;
	/**
	 * 데이터를 fetch하는 중 발생한 에러
	 */
	error: string | undefined;
};

export type RequestAction = Action & {
	payload: unknown;
	meta: {
		uri: string;
	};
};
