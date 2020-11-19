import { Post, Submittable } from ".";

export interface Activity extends Post, Submittable {
	/**
	 * @description 수업활동일지 게시물 ID
	 * URL을 통한 자원 접근 시 사용됨
	 * 
	 * @example 28465
	 */
	readonly id: string,
	/**
	 * @description 제출방식
	 * 
	 * @example 개인제출
	 */
	type?: string,
	/**
	 * @description 제목
	 * 
	 * @example 12주차 수업활동일지 제출 - 12장 파일처리
	 */
	title: string,
	/**
	 * @description 수업내용
	 * 
	 * @example 수업활동일지와 C 파일 압축하여 제출바랍니다.
	 */
	contents?: string,
	/**
	 * @description 게시물 날짜 별 정렬을 위해 createdAt은 period.from 으로 설정
	 */
	createdAt: Date,
	/**
	 * @description 평가결과
	 */
	result?: {
		/**
		 * @description 코멘트
		 */
		comment?: string
	}
}