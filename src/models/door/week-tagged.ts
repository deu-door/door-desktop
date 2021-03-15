/**
 * @description 주차-차시가 지정되어 있는 게시물 및 기타 등등
 */
export interface WeekTagged {
	/**
	 * @description 주차
	 *
	 * @example 3 (3주차)
	 */
	week: number;
	/**
	 * @description 차시
	 *
	 * @example 4 (4차시)
	 */
	period: number;
}
