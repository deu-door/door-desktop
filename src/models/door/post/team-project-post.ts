import { CourseSubordinated } from '../course/course';
import { ResourceID } from '../identifiable';
import { ISubmittablePost } from './submittable-post';

/**
 * @description 팀 프로젝트 목록을 받아올 때 알 수 없는 정보를 뺀 인터페이스
 */
export type ITeamProjectPostHead = Omit<ITeamProjectPost, 'contents' | 'attachments' | 'submission' | 'submitted'>;

/**
 * @description 팀 프로젝트 정보를 담은 인터페이스
 *
 * @url http://door.deu.ac.kr/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo={course.id}&ProjectNo={id}
 */
export interface ITeamProjectPost extends ISubmittablePost, CourseSubordinated {
	/**
	 * @description 팀 프로젝트 게시물 ID
	 * URL을 통한 자원 접근 시 사용됨
	 *
	 * @example 35164
	 */
	readonly id: ResourceID;
	/**
	 * @description 제출방식
	 *
	 * @example 팀장 제출
	 */
	type: string;
	/**
	 * @description 제목
	 *
	 * @example 팀 프로젝트 중간발표
	 */
	title: string;
	/**
	 * @description 팀 프로젝트의 구체적인 내용
	 *
	 * @example 중간 경과를 PPT로 정리하여 발표할 것
	 */
	contents: string;
	/**
	 * @description 게시물 날짜 별 정렬을 위해 createdAt은 period.from 으로 설정
	 */
	createdAt: string;
}
