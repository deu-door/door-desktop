import { CourseSubordinated, Fetchable } from ".";

/**
 * @description Door 컨텐츠 진행 여부. 주차-차시로 컨텐츠 구분
 */
export interface LearningStatus extends Fetchable, CourseSubordinated {
	list: Array<{
		/**
		 * @description 수업 이름
		 */
		title: string,
		/**
		 * @description 주차
		 */
		week: number,
		/**
		 * @description 순서
		 */
		order: number,
		/**
		 * @description 조회 여부
		 */
		read: boolean
	}>
}
