import { Identifiable, ResourceID } from './identifiable';

/**
 * @description 학기 인터페이스
 *
 * @example 2020년 1학기, 2020년 하계학기(계절학기)
 */
export interface ITerm extends Identifiable {
	/**
	 * @description 학기에 해당되는 ID
	 *
	 * @example 7
	 */
	readonly id: ResourceID;
	/**
	 * @description 학기 이름
	 *
	 * @example 2020년 1학기
	 */
	name: string;
}

/**
 * @description 학기의 하위 데이터에 해당되는 인터페이스
 */
export interface TermSubordinated {
	/**
	 * @description 학기의 ID
	 */
	readonly termId: ResourceID;
}
