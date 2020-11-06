import { Achievable, Attachment, CourseSubordinated, FetchableMap, Identifiable, Post } from ".";

export interface LecturesByWeek extends Identifiable, CourseSubordinated, FetchableMap<Lecture> {
	/**
	 * @description 주차
	 * 
	 * @example 3
	 */
	readonly id: string,
	/**
	 * @description 주차 주제
	 * 
	 * @example 8장 포인터
	 */
	description: string,
	/**
	 * @description 조회수
	 */
	views: number,
	/**
	 * @description 강의 수
	 */
	count: number
}

/**
 * @description 강의 동영상 또는 유튜브 정보를 담은 인터페이스
 * 
 * door.deu.ac.kr/Door/DoorView?DoorNo={id}&InningNo={}&CoursesNo={}
 */
export interface Lecture extends Post, Attachment, Achievable {
	/**
	 * @description Door ID
	 * 
	 * @example 44693
	 */
	readonly id: string,
	/**
	 * @description 강의 주차
	 * 
	 * @example 4
	 */
	week: number,
	/**
	 * @description 강의 링크
	 * 
	 * @example youtu.be/~~~
	 */
	link: string,
	/**
	 * @description 강의 제목
	 * 
	 * @example 기초프로그래밍II 8장 포인터
	 */
	title: string,
	/**
	 * @description 강의 설명
	 * 
	 * @example 포인터 관련 내용에 대한 강의
	 */
	contents: string,
	/**
	 * @description 강의 등록 날짜
	 * 
	 * @exampel 2020.10.24
	 */
	createdAt: Date,
	/**
	 * @description 조회수
	 */
	views: number,
	/**
	 * @description 강의 태그
	 * 
	 * @example 자바
	 */
	tags: string[]
}
