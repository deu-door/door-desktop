export type ResourceID = string;

/**
 * @description URL에서 또는 로컬에서 인식할 수 있는 자원 인터페이스
 */
export interface Identifiable {
	/**
	 * @description URL 상에서 자원을 인식할 수 있는 고유 ID
	 */
	readonly id: ResourceID;
}
