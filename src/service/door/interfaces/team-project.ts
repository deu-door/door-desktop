import { Post, Submittable } from ".";

/**
 * @description 과제 정보를 담은 인터페이스
 * 
 * door.deu.ac.kr/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo={course.id}&HomeworkNo={id}
 */
export interface TeamProject extends Post, Submittable {
	/**
	 * @description 팀 프로젝트 게시물 ID
	 * URL을 통한 자원 접근 시 사용됨
	 * 
	 * @example 35164
	 */
	readonly id: string,
	/**
	 * @description 제출방식
	 * 
	 * @example 팀장 제출
	 */
	type: string,
	/**
	 * @description 제목
	 * 
	 * @example 팀 프로젝트 중간발표
	 */
	title: string,
	/**
	 * @description 팀 프로젝트의 구체적인 내용
	 * 
	 * @example 중간 경과를 PPT로 정리하여 발표할 것
	 */
	contents?: string,
	/**
	 * @description 게시물 날짜 별 정렬을 위해 createdAt은 period.from 으로 설정
	 */
	createdAt: Date
}