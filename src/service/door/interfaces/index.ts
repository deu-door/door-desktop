export type ID = string;

/**
 * @description URL에서 또는 로컬에서 인식할 수 있는 자원 인터페이스
 */
export interface Identifiable {
	/**
	 * @description URL 상에서 자원을 인식할 수 있는 고유 ID
	 */
	readonly id: ID
}

/**
 * @description Course 인터페이스에 종속되어 있는 인터페이스
 */
export interface CourseSubordinated {
	/**
	 * @description Course의 id
	 */
	readonly courseId: ID
}

/**
 * @description 원격 자원(예: Rest API Resource)의 상태를 나타내는 인터페이스
 */
export interface Fetchable {
	/**
	 * @description 해당 자원이 최종적으로 fetch가 끝난 지 여부
	 */
	fulfilled: boolean,
	/**
	 * @description 자원을 가지고 오고 있는 중인지 여부
	 */
	pending?: boolean,
	/**
	 * @description 자원을 마지막으로 fetch한 시간
	 */
	fetchedAt?: Date,
	/**
	 * @description 자원을 가져오는 중 발생한 에러
	 */
	error?: Error|string
}

/**
 * @description Fetchable Array Wrapper 인터페이스
 */
export interface FetchableArray<T> extends Fetchable {
	/**
	 * @description Fetch된 아이템 목록
	 */
	items: T[]
}

/**
 * @description Fetchable Object Wrapper 인터페이스
 */
export interface FetchableMap<T> extends Fetchable {
	/**
	 * @description Fetch된 아이템 목록
	 */
	items: { [key: string]: T }
}

export const fulfilledFetchable = () => ({
	fulfilled: true,
	pending: false,
	fetchedAt: new Date()
} as Fetchable);

export const notFulfilledFetchable = () => ({
	fulfilled: false,
	pending: false
} as Fetchable);

export const errorThrowedFetchable = (e: Error & string) => ({
	pending: false,
	error: e.message || e
} as Fetchable);

export interface Attachment {
	/**
	 * @description 첨부파일 이름
	 */
	title: string,
	/**
	 * @description 첨부파일의 용량. 없을 수도 있음
	 */

	/**
	 * @description 기록을 남겨주는 링크
	 */
	historyLink?: Link,
	/**
	 * @description 첨부파일 링크
	 */
	link: string
}

export interface Link {
	/**
	 * @description 해당 링크의 URL
	 */
	url: string,
	/**
	 * @description 링크 METHOD (GET, POST...)
	 */
	method?: 'GET' | 'POST',
	/**
	 * @description AJAX data
	 */
	data?: string|Record<string, unknown>
}

/**
 * @description 게시물 형태를 띄는 자원 인터페이스
 */
export interface Post extends Identifiable, Fetchable, CourseSubordinated {
	/**
	 * @description 게시물의 제목
	 */
	title: string,
	/**
	 * @description 게시물의 작성자
	 * 
	 * 게시물의 성격에 따라 작성자가 없을 수도 있음
	 */
	author?: string,
	/**
	 * @description 게시물을 읽었는지 여부
	 */
	//read: boolean,
	/**
	 * @description 게시물 등록일
	 * 
	 * @example 2020-10-13 16:12:21
	 */
	createdAt: Date,
	/**
	 * @description 게시물 조회수
	 * 
	 * 게시물의 성격에 따라 조회수 데이터가 없을 수도 있음
	 */
	views?: number,
	/**
	 * @description 게시물의 내용
	 * 
	 * 게시물을 불러오지 않은 경우 없을 수도 있음
	 */
	contents?: string,
	/**
	 * @description 첨부파일 목록
	 */
	attachments?: Attachment[]
}

/**
 * @description 제출 가능한 형식의 게시글
 */
export interface Submittable {
	/**
	 * @description 제출 내용
	 */
	submission: Submission,
	/**
	 * @description 제출 여부
	 */
	submitted: boolean,
	/**
	 * @description 제출기간
	 * 
	 * @example { from: Date(20-09-01 10:00), to: Date(20-09-07 23:59) }
	 */
	period: {
		from: Date,
		to: Date
	},
	/**
	 * @description 추가 제출기간
	 * 
	 * @example { from: Date(20-09-10 10:00), to: Date(20-09-11:23:59) }
	 */
	bonusPeriod?: {
		from: Date,
		to: Date
	},
	/**
	 * @description 평가 결과
	 */
	evaluationResult?: {
		/**
		 * @description 평가 결과 점수
		 * 
		 * @example 90
		 */
		score?: number,
		/**
		 * @description 평가 결과 코멘트
		 * 
		 * @example 예제 8-1번 정답은 2번이 아닌 4번임
		 */
		comment?: string
	}
}

/**
 * @description 제출 정보를 나타내는 인터페이스
 */
export interface Submission {
	/**
	 * @description 제출 내용
	 * 
	 * @example 금일 진행한 조별과제 회의록
	 */
	contents: string,
	/**
	 * @description 첨부파일
	 */
	attachments: Attachment[],
	/**
	 * @description 제출 여부
	 */
	submitted: boolean,
	/**
	 * @description 제출 시 필요한 Form Data
	 */
	form: {
		/**
		 * @description 제출 URL
		 */
		url: string,
		/**
		 * @description 제출 Method
		 */
		method?: 'GET' | 'POST',
		/**
		 * @description encription type
		 * 
		 * @example multipart/form-data
		 */
		enctype?: string,
		/**
		 * @description 제출 내용 input name
		 * 
		 * @example coursehomeworksubmits.SubmitContents
		 */
		contentsKeyName?: string,
		/**
		 * @description 첨부파일 input name
		 * 
		 * @example TFFile
		 */
		fileKeyName?: string,
		/**
		 * @description 제출할 내용
		 * 
		 * @example 금학기 과제입니다.
		 */
		contents?: string,
		/**
		 * @description 제출할 파일
		 * 
		 * @example 과제.zip
		 */
		file?: File,
		/**
		 * @description 기타 Form data
		 */
		data?: Record<string, string>
	}
}

export const sortPostById = <T extends Post>(map: FetchableMap<T>): T[] => {
	return Object.values(map.items).sort(sortPostByIdComparator);
}

export const sortPostByIdComparator = <T extends Post>(postA: T, postB: T): number => {
	const a = Number(postA.id);
	const b = Number(postB.id);

	if(isNaN(a) || isNaN(b)) return 0;

	return a - b;
}

export const sortPostByCreatedAt = <T extends Post>(map: FetchableMap<T>): T[] => {
	return Object.values(map.items).sort(sortPostByCreatedAtComparator);
}

export const sortPostByCreatedAtComparator = <T extends Post>(postA: T, postB: T): number => {
	const a = new Date(postA.createdAt);
	const b = new Date(postB.createdAt);

	return a > b ? 1 : a < b ? -1 : 0;
}

/**
 * @description 달성 여부가 존재하는 인터페이스
 */
export interface Achievable extends Identifiable {
	/**
	 * @description 달성 여부
	 */
	achieved: boolean
}
