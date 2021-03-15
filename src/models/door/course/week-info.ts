export interface ICourseWeekInfo {
	/**
	 * @description 주차
	 *
	 * @example 3
	 */
	week: string;
	/**
	 * @description 주차에 해당되는 날짜 (부터~)
	 *
	 * @example 2020-11-03
	 */
	from: Date;
	/**
	 * @description 주차에 해당되는 날짜 (~까지)
	 */
	to: Date;
	/**
	 * @description 강의내용
	 *
	 * @example 9장 변수 유효범위와 함수 활용(1)
	 */
	contents?: string;
	/**
	 * @description 과제/비고
	 *
	 * @example 프로그램 수시 평가 / 1차 과제 제출
	 */
	remark?: string;
}
