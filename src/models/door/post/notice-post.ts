import { CourseSubordinated } from '../course/course';
import { Authored, IPost } from './post';

/**
 * @description 공지사항 목록을 가져올 때 알 수 없는 정보를 뺀 인터페이스
 */
export type INoticePostHead = Omit<INoticePost, 'contents' | 'attachments'>;

/**
 * @description 공지사항 정보를 담은 인터페이스
 *
 * @url http://door.deu.ac.kr/BBS/Board/Detail/CourseNotice/{id}?cNo={course.id}
 */
export interface INoticePost extends IPost, Authored, CourseSubordinated {
	/**
	 * @description 공지사항의 작성자
	 */
	author: string;
	/**
	 * @description 공지사항을 작성한 시간
	 */
	createdAt: string;
	/**
	 * @description 조회수
	 */
	views: number;
	/**
	 * @description 내용
	 */
	contents: string;
}
