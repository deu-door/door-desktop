import { Fetchable, Identifiable } from ".";

/**
 * @description 로그인/비로그인을 포함하는 유저 정보입니다.
 */
export interface User extends Fetchable {
	/**
	 * @description 로그인 되어있는지 여부입니다.
	 */
	authenticated: boolean,
	/**
	 * @description 프로필 정보입니다. 학번, 이름 등이 포함됩니다.
	 */
	profile?: Profile
}

/**
 * @description 유저에 관한 정보입니다.
 */
export interface Profile extends Identifiable, Fetchable {
	/**
	 * @description Door 시스템에서 사용되는 아이디(학번)
	 * 
	 * @example 20172000
	 */
	readonly id: string,
	/**
	 * @description Door 시스템 상 등록되어 있는 이름
	 * 
	 * @example 홍길동
	 */
	name: string,
	/**
	 * @description 학생 구분
	 * 
	 * @example 학부생
	 */
	type: string,
	/**
	 * @description 전공
	 * 
	 * @example 컴퓨터공학과
	 */
	major: string,
	/**
	 * @description 프로필 사진 URL
	 */
	image: string
}