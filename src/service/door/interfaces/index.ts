export type ID = string;

/**
 * @description URL에서 또는 로컬에서 인식할 수 있는 자원 인터페이스
 */
export interface Identifiable {
	/**
	 * @description URL 상에서 자원을 인식할 수 있는 고유 ID
	 */
	id: ID
}

/**
 * @description 원격 자원(예: Rest API Resource)의 상태를 나타내는 인터페이스
 */
export interface Fetchable {
	/**
	 * @description 해당 자원이 최종적으로 fetch가 끝난 지 여부
	 */
	fulfilled: boolean,
	/**
	 * @description 자원을 가지고 오고 있는 중인지 여부
	 */
	pending?: boolean,
	/**
	 * @description 자원을 마지막으로 fetch한 시간
	 */
	fetchedAt?: Date,
	/**
	 * @description 자원을 가져오는 중 발생한 에러
	 */
	error?: Error|string
}

/**
 * @description Fetchable Array Wrapper 인터페이스
 */
export interface FetchableArray<T> extends Fetchable {
	/**
	 * @description Fetch된 아이템 목록
	 */
	items: T[]
}

/**
 * @description Fetchable Object Wrapper 인터페이스
 */
export interface FetchableMap<T> extends Fetchable {
	/**
	 * @description Fetch된 아이템 목록
	 */
	items: { [key: string]: T }
}

export const fulfilledFetchable = () => ({
	fulfilled: true,
	pending: false,
	fetchedAt: new Date()
} as Fetchable);

export const notFulfilledFetchable = () => ({
	fulfilled: false,
	pending: false,
	fetchedAt: new Date()
} as Fetchable);

export const errorThrowedFetchable = (e: Error & string) => ({
	pending: false,
	error: e.message || e,
	fetchedAt: new Date()
} as Fetchable);

/**
 * @description 게시물 형태를 띄는 자원 인터페이스
 */
export interface Post extends Identifiable, Fetchable {
	/**
	 * @description 게시물의 제목
	 */
	title: string,
	/**
	 * @description 게시물의 작성자
	 * 
	 * 게시물의 성격에 따라 작성자가 없을 수도 있음
	 */
	author?: string,
	/**
	 * @description 게시물을 읽었는지 여부
	 */
	read: boolean,
	/**
	 * @description 게시물 조회수
	 * 
	 * 게시물의 성격에 따라 조회수 데이터가 없을 수도 있음
	 */
	views: number,
	/**
	 * @description 게시물의 내용
	 * 
	 * 게시물을 불러오지 않은 경우 없을 수도 있음
	 */
	contents?: string
}

/**
 * @description 달성 여부가 존재하는 인터페이스
 */
export interface Achievable extends Identifiable {
	/**
	 * @description 달성 여부
	 */
	achieved: boolean
}

export const initializeAchievable = () => ({
	achieved: false
});