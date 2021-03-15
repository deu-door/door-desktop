import { CourseSubordinated } from '../course/course';
import { ResourceID } from '../identifiable';
import { ISubmittablePost } from './submittable-post';

/**
 * @description 과제 목록을 받아올 때 알 수 없는 정보를 제외한 과제 정보 인터페이스
 */
export type IAssignmentPostHead = Omit<IAssignmentPost, 'contents' | 'attachments' | 'submission'>;

/**
 * @description 과제 정보를 담은 인터페이스
 *
 * @url http://door.deu.ac.kr/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo={course.id}&HomeworkNo={assignment.id}
 */
export interface IAssignmentPost extends ISubmittablePost, CourseSubordinated {
	/**
	 * @description 과제 게시물 ID
	 * URL을 통한 자원 접근 시 사용됨
	 *
	 * @example 58662
	 */
	readonly id: ResourceID;
	/**
	 * @description 과제유형
	 *
	 * @example 개인과제
	 */
	type: string;
	/**
	 * @description 제목
	 *
	 * @example 1주차 과제 - 프로그래밍
	 */
	title: string;
	/**
	 * @description 과제의 구체적인 내용
	 *
	 * @example 첨부파일을 참조하여 연습문제와 실습문제를 수행할 것
	 */
	contents: string;
	/**
	 * @description 게시물 날짜 별 정렬을 위해 createdAt은 period.from 으로 설정
	 */
	createdAt: string;
}
