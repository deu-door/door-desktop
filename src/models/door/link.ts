/**
 * @description Fetch 가능한 링크에 대한 정보
 */
export interface ILink {
	/**
	 * @description 해당 링크의 URL
	 */
	url: string;
	/**
	 * @description 링크 METHOD (GET, POST...)
	 */
	method?: 'GET' | 'POST';
	/**
	 * @description AJAX data
	 */
	data?: string | Record<string, unknown>;
}
