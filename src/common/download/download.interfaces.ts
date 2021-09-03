export type DownloadState = 'progressing' | 'completed' | 'cancelled';

/**
 * Door Desktop 내부적으로 다운로드 파일을 관리하기 위한 타입
 */
export type DownloadItem = {
	/**
	 * 각 다운로드를 구분하기 위한 유일 값 (nanoid)
	 */
	id: string;
	filename: string;
	url: string;
	savePath: string;
	/**
	 * 다운중인 파일의 전체 크기를 알 수 있는지 여부
	 */
	lengthComputable: boolean;
	/**
	 * 다운로드할 파일의 크기
	 */
	totalBytes: number;
	/**
	 * 다운로드된 파일 크기
	 */
	receivedBytes: number;
	/**
	 * 다운로드 %를 0.0 ~ 1.0 사이의 값으로 표현
	 */
	progress: number;
	/**
	 * 다운로드할 파일의 상태
	 */
	state: DownloadState;
	/**
	 * 다운로드를 시작한 시간
	 */
	startAt: string;
	/**
	 * 에러 발생 여부 (에러 발생 시 메세지)
	 */
	error?: string;
};
