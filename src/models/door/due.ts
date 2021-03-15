/**
 * @description 기한이 지정되어 있는
 */
export interface Due {
	/**
	 * @description 정해진 기한
	 */
	duration: {
		from: string;
		to: string;
	};
	/**
	 * @description 추가로 주어진 기한
	 */
	additionalDuration?: {
		from: string;
		to: string;
	};
}
