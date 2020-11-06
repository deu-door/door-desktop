import { Achievable, Attachment, Post } from ".";

/**
 * @description 과제 정보를 담은 인터페이스
 * 
 * door.deu.ac.kr/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo={course.id}&HomeworkNo={id}
 */
export interface Assignment extends Post, Achievable {
	/**
	 * @description 과제 게시물 ID
	 * URL을 통한 자원 접근 시 사용됨
	 * 
	 * @example 58662
	 */
	readonly id: string,
	/**
	 * @description 과제유형
	 * 
	 * @example 개인과제
	 */
	type: string,
	/**
	 * @description 제목
	 * 
	 * @example 1주차 과제 - 프로그래밍
	 */
	title: string,
	/**
	 * @description 과제의 구체적인 내용
	 * 
	 * @example 첨부파일을 참조하여 연습문제와 실습문제를 수행할 것
	 */
	contents?: string,
	/**
	 * @description 게시물 날짜 별 정렬을 위해 createdAt은 period.from 으로 설정
	 */
	createdAt: Date,
	/**
	 * @description 제출기간
	 * 
	 * @example { from: Date(20-09-01 10:00), to: Date(20-09-07 23:59) }
	 */
	period: {
		from: Date,
		to: Date
	},
	/**
	 * @description 제출정보 - 제출 내용
	 */
	submittedContents?: string,
	/**
	 * @description 제출정보 - 첨부파일
	 */
	submittedAttachments?: Attachment[],
	/**
	 * @description 평가결과
	 */
	result?: {
		/**
		 * @description 점수
		 */
		score?: number,
		/**
		 * @description 코멘트
		 */
		comment?: string
	}
}