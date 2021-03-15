import { CourseSubordinated } from '../course/course';
import { Identifiable } from '../identifiable';
import { Partible } from '../partible';
import { IAttachment } from './attachment';
import { PostVariant } from './variant';

/**
 * @description 게시물이 목록 상에서 표시되는 정보
 */
export type IPostHead = Omit<IPost, 'contents' | 'attachments'>;

/**
 * @description 게시물 형태를 띄는 자원 인터페이스
 */
export interface IPost extends Identifiable, Partible, CourseSubordinated {
	/**
	 * @description 게시물의 종류
	 *
	 * @see {PostVariant}
	 */
	variant: PostVariant;
	/**
	 * @description 게시물의 제목
	 */
	title: string;
	/**
	 * @description 게시물 등록일 (타임스탬프)
	 *
	 * @example 2021-03-01T17:30:00Z
	 */
	createdAt: string;
	/**
	 * @description 게시물 조회수
	 *
	 * 게시물의 성격에 따라 조회수 데이터가 없을 수도 있음
	 */
	views?: number;
	/**
	 * @description 게시물의 내용
	 *
	 * 게시물을 불러오지 않은 경우 없을 수도 있음
	 */
	contents: string;
	/**
	 * @description 첨부파일 목록
	 */
	attachments: IAttachment[];
	/**
	 * @description 게시물이 모든 정보를 포함하고 있는지 여부
	 *
	 * 게시물의 특성 상 리스트로 받아올 때 전체 정보가 포함되어있지 않음.
	 */
	partial: boolean;
}

/**
 * @description 작성자가 존재하는 게시물
 *
 * 게시물의 성격에 따라 작성자가 없을 수도 있음
 */
export interface Authored {
	/**
	 * @description 게시물의 작성자
	 *
	 * @example 김성우
	 */
	author: string;
}
