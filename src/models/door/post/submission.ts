import { IAttachment } from './attachment';

/**
 * @description 제출 정보를 나타내는 인터페이스
 */
export interface ISubmission {
	/**
	 * @description 제출 내용
	 *
	 * @example 금일 진행한 조별과제 회의록
	 */
	contents: string;
	/**
	 * @description 첨부파일
	 */
	attachments: IAttachment[];
	/**
	 * @description 제출 시 필요한 Form Data
	 */
	//form: ISubmissionForm;
}
