import { Identifiable, ResourceID } from './identifiable';

/**
 * @description 유저에 관한 정보입니다.
 */
export interface IUser extends Identifiable {
	/**
	 * @description Door 시스템에서 사용되는 아이디(학번)
	 *
	 * @example 20172000
	 */
	readonly id: ResourceID;
	/**
	 * @description Door 시스템 상 등록되어 있는 이름
	 *
	 * @example 홍길동
	 */
	name: string;
	/**
	 * @description 학생 구분
	 *
	 * @example 학부생
	 */
	type: string;
	/**
	 * @description 전공
	 *
	 * @example 컴퓨터공학과
	 */
	major: string;
	/**
	 * @description 프로필 사진 URL
	 */
	image: string;
}
