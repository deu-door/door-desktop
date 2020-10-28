import { Achievable, Post } from ".";

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
	 * @description 제출기간
	 * 
	 * @example { from: Date(20-09-01 10:00), to: Date(20-09-07 23:59) }
	 */
	period: {
		from: Date,
		to: Date
	},
	/**
	 * @description 첨부파일
	 * 
	 * @example 5장-홍길동.hwp
	 */
	attachment?: string
}