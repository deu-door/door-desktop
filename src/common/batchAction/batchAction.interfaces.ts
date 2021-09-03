/**
 * action들을 하나로 묶어 실행하였을 때 진행 상태를 확인하기 위한 인터페이스
 */
export type BatchActionProgress = {
	/**
	 * 식별자
	 */
	id: string;
	/**
	 * 진행 상태
	 */
	state: 'progressing' | 'completed';
	/**
	 * 전체 갯수
	 */
	total: number;
	/**
	 * 현재 완료된 갯수
	 */
	current: number;
	/**
	 * 현재 / 전체 값
	 */
	progress: number;
	/**
	 * 로딩 메세지 (action.meta.message)의 값을 가져옴
	 */
	message: string;
};
