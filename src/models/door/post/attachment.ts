import { ILink } from '../link';

/**
 * @description 첨부파일 정보를 담은 인터페이스
 */
export interface IAttachment {
	/**
	 * @description 첨부파일 이름
	 */
	title: string;
	/**
	 * @description 첨부파일의 용량. 없을 수도 있음
	 */

	/**
	 * @description 기록을 남겨주는 링크
	 */
	historyLink?: ILink;
	/**
	 * @description 첨부파일 링크
	 */
	link: string;
}
