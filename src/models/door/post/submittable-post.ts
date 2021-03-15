import { Due } from '../due';
import { IPost } from './post';
import { ISubmission } from './submission';

/**
 * @description 제출 가능한 형식의 게시글
 */
export interface ISubmittablePost extends IPost, Due {
	/**
	 * @description 제출 내용
	 */
	submission: ISubmission;
	/**
	 * @description 제출 여부
	 */
	submitted: boolean;
	/**
	 * @description 평가 결과
	 */
	evaluationResult?: {
		/**
		 * @description 평가 결과 점수
		 *
		 * @example 90
		 */
		score?: number;
		/**
		 * @description 평가 결과 코멘트
		 *
		 * @example 예제 8-1번 정답은 2번이 아닌 4번임
		 */
		comment?: string;
	};
}
