import { Attachment, Post } from ".";

/**
 * @description 공지사항 정보를 담은 인터페이스
 * 
 * door.deu.ac.kr/BBS/Board/Detail/CourseNotice/{id}?cNo={course.id}
 */
export interface Reference extends Post {
	/**
	 * @description 공지사항의 작성자
	 */
	author: string,
	/**
	 * @description 공지사항을 작성한 시간
	 */
	createdAt: Date,
	/**
	 * @description 조회수
	 */
	views: number,
	/**
	 * @description 내용
	 */
	contents?: string,
	/**
	 * @description 첨부파일
	 */
	attachments?: Attachment[]
}
