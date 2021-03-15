import { CourseSubordinated } from '../course/course';
import { ResourceID } from '../identifiable';
import { ISubmittablePost } from './submittable-post';

/**
 * @description 수업활동일지 목록을 받아올 때 알 수 없는 정보를 뺀 수업활동일지 인터페이스
 */
export type IActivityPostHead = Omit<IActivityPost, 'contents' | 'attachments' | 'submission' | 'submitted'>;

/**
 * @description 수업활동일지 인터페이스, 과제 인터페이스랑 똑같음 (같은 URL 사용)
 *
 * @url http://door.deu.ac.kr/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo={course.id}&HomeworkNo={activity.id}
 */
export interface IActivityPost extends ISubmittablePost, CourseSubordinated {
	/**
	 * @description 수업활동일지 게시물 ID
	 * URL을 통한 자원 접근 시 사용됨
	 *
	 * @example 28465
	 */
	readonly id: ResourceID;
	/**
	 * @description 제출방식
	 *
	 * @example 개인제출
	 */
	type: string;
	/**
	 * @description 제목
	 *
	 * @example 12주차 수업활동일지 제출 - 12장 파일처리
	 */
	title: string;
	/**
	 * @description 수업내용
	 *
	 * @example 수업활동일지와 C 파일 압축하여 제출바랍니다.
	 */
	contents: string;
	/**
	 * @description 게시물 날짜 별 정렬을 위해 createdAt은 period.from 으로 설정
	 */
	createdAt: string;
}
