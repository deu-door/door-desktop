import { CourseSubordinated } from '../course/course';
import { Due } from '../due';
import { ResourceID } from '../identifiable';
import { WeekTagged } from '../week-tagged';
import { IAttachment } from './attachment';
import { IPost } from './post';

export type IDoorPostHead = Omit<IDoorPost, 'contents' | 'attachments' | 'doors'>;

/**
 * @description 주차별 DOOR. 하나의 DOOR에는 여러가지 강의, 자료 등이 있을 수 있음
 */
export interface IDoorPost extends IPost, WeekTagged, Due, CourseSubordinated {
	/**
	 * @description 주차
	 *
	 * @example 3
	 */
	readonly id: ResourceID;
	/**
	 * @description 주차 주제
	 *
	 * @example 8장 포인터
	 */
	title: string;
	/**
	 * @description 과제/비고
	 *
	 * @example 정보공학관 수요일 816/817 실습 수업
	 */
	//remark: string;
	/**
	 * @description 조회수
	 */
	views: number;
	/**
	 * @description 서버에 등록되어 있는 강의 수
	 *
	 * 실제 로컬에 있는 강의 수 보다 많은 경우 fetch가 필요함
	 */
	registeredDoorsCount: number;
	/**
	 * @description 강의 목록
	 */
	doors: IDoor[];
}

/**
 * @description 강의 동영상 또는 유튜브 정보를 담은 DOOR 인터페이스
 *
 * door.deu.ac.kr/Door/DoorView?DoorNo={id}&InningNo={}&CoursesNo={}
 */
export interface IDoor extends IAttachment, CourseSubordinated {
	/**
	 * @description Door ID
	 *
	 * @example 44693
	 */
	readonly id: ResourceID;
	/**
	 * @description 강의 주차
	 *
	 * @example 4
	 */
	week: number;
	/**
	 * @description 강의 링크
	 *
	 * @example youtu.be/~~~
	 */
	link: string;
	/**
	 * @description 강의 제목
	 *
	 * @example 기초프로그래밍II 8장 포인터
	 */
	title: string;
	/**
	 * @description 강의 설명
	 *
	 * @example 포인터 관련 내용에 대한 강의
	 */
	contents: string;
	/**
	 * @description 강의 등록 날짜
	 */
	createdAt: string;
	/**
	 * @description 조회수
	 */
	views: number;
	/**
	 * @description 강의 태그
	 *
	 * @example 자바
	 */
	tags: string[];
}
