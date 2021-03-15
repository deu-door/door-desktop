/**
 * @description 강의 평가 비율에 대한 정보를 담고 있는 인터페이스
 */
export interface ICourseRateInfo {
	/**
	 * @description 중간고사
	 */
	midterm: number;
	/**
	 * @description 기말고사
	 */
	finalterm: number;
	/**
	 * @description 퀴즈
	 */
	quiz: number;
	/**
	 * @description 과제
	 */
	assignment: number;
	/**
	 * @description 팀PJ
	 */
	teamProject: number;
	/**
	 * @description 출석
	 */
	attendance: number;
	/**
	 * @description 기타1
	 */
	etc1: number;
	/**
	 * @description 기타2
	 */
	etc2: number;
	/**
	 * @description 기타3
	 */
	etc3: number;
	/**
	 * @description 발표
	 */
	presentation: number;
	/**
	 * @description 참여도
	 */
	participation: number;
}
