import axios from 'axios';
import qs from 'qs';
import { ILink, ISubmission } from 'models/door';
import { YouTubeURLParser } from '@iktakahiro/youtube-url-parser';

/**
 * Axios 객체. door 홈페이지 요청에 대해 맞춤 설정되어 있음
 */
export const driver = axios.create({
	baseURL: 'http://door.deu.ac.kr',
	headers: {
		// 기본 Accept 헤더는 application/json, text/plain, */* 이렇게 되어있는데
		// 기본 값으로 사용시 서버 측에서 500 Internal 에러 발생
		// IMPORTANT: Accept 헤더는 반드시 */* 로 해야됨
		Accept: '*/*',
		// 서버 측에선 application/x-www-form-urlencoded 외엔 인식하지 못함
		'Content-Type': 'application/x-www-form-urlencoded',
	},
	transformRequest: [(data, headers) => qs.stringify(data, { arrayFormat: 'brackets' })],
	withCredentials: true,
	validateStatus: status => status >= 200 && status <= 302,
	timeout: 5000,
});

// Logging request
driver.interceptors.request.use(request => {
	console.log('[Axios] Starting Request', request);
	return request;
});

// Logging response
driver.interceptors.response.use(response => {
	console.log('[Axios] Receive Response', response);
	return response;
});

/**
 * 업로드용 Axios 객체. door 홈페이지 업로드 요청에 맞춤 설정되어 있음
 */
export const uploader = axios.create({
	baseURL: 'http://door.deu.ac.kr',
	headers: {
		Accept: '*/*',
		// Content-Type이 반드시 빠져있어야 함.
		// Content-Type이 multipart/form-data인 경우 반드시 브라우저에서 채워넣어야 함
	},
});

export const parser = new DOMParser();

export const parse = (content: string): ReturnType<typeof parser.parseFromString> => parser.parseFromString(content, 'text/html');

// delayed all request (0.8s)
// doorAxios.interceptors.request.use(async request => {
// 	await new Promise(resolve => setTimeout(() => resolve(), 100));
// 	return request;
// });

interface Cell {
	[key: string]: {
		text: string;
		url: string | undefined;
		element: HTMLElement;
	};
}

/**
 * HTML 테이블 Element를 Cheerio를 사용하여 배열로 파싱합니다.
 *
 * @param table 파싱할 테이블 cheerio.Element입니다.
 */
export function parseTableElement(table: HTMLTableElement): Array<Cell> {
	const tableElements = Array.from(table.querySelectorAll('tbody tr,thead tr')).map(tr =>
		// tbody이어도 th 태그가 포함될 수 있음 (서버 단에서 그렇게 하기 때문)
		Array.from(tr.querySelectorAll<HTMLElement>('td,th')),
	);

	// rowspan 처리
	tableElements.forEach((row, i) => {
		row.forEach((td, j) => {
			if (td.hasAttribute('rowspan')) {
				const rowspan = Number(td.getAttribute('rowspan'));
				td.removeAttribute('rowspan');

				for (let k = 1; k < rowspan; k++) {
					tableElements[i + k].splice(j, 0, td);
				}
			}

			if (td.hasAttribute('colspan')) {
				const colspan = Number(td.getAttribute('colspan'));
				td.removeAttribute('colspan');

				for (let k = 1; k < colspan; k++) {
					tableElements[i].splice(j, 0, td);
				}
			}
		});
	});

	console.log(tableElements.map(row => row.map(d => d.innerText.trim())));

	let rows = tableElements.map(tr =>
		tr.map(td => ({
			text: td.innerText.trim(),
			url: td.querySelector('*[href]')?.getAttribute('href') || undefined,
			element: td,
		})),
	);

	// 첫 번째 row 사용
	const headers = rows.shift()?.map(d => d.text) || [];

	// 헤더의 갯수와 데이터 필드의 개수가 일치하지 않으면 Filter
	// Door 홈페이지에서, 게시물이 하나도 없을 경우 <td colspan="9">등록된 과제가 없습니다.</td> 를 띄우는데,
	// 이를 필터링하기 위함
	rows = rows.filter(row => row.length === headers.length);

	const tableParsed = rows.map(row => {
		const newRow: Cell = {};
		headers.forEach((header, index) => {
			newRow[header] = row[index];
		});
		return newRow;
	});

	console.log(tableParsed);

	return tableParsed;
}

/**
 * HTML 테이블 Element를 Cheerio를 사용하여 Object로 파싱합니다.
 *
 * @param table 파싱할 테이블 cheerio.Element입니다.
 */
export function parseInformaticTableElement(table: HTMLTableElement): Cell {
	const data: Cell = {};

	table.querySelectorAll<HTMLTableHeaderCellElement>('tbody th').forEach(th => {
		const td = th.nextElementSibling;

		if (!(td instanceof HTMLTableCellElement)) return;

		data[th.innerText.trim()] = {
			text: td.innerText.trim(),
			url: td.querySelector('*[href]')?.getAttribute('href') || undefined,
			element: td,
		};
	});

	return data;
}

export const parseSubmission = (table: HTMLTableElement): ISubmission => {
	return {
		contents: table.querySelector('textarea')?.innerText ?? '',
		attachments: Array.from(table.querySelectorAll<HTMLAnchorElement>('.filelist .fileitembox a[title=다운로드]'))
			.map(element => ({
				link: element.getAttribute('href') ?? '',
				title: element.innerText ?? '파일',
			}))
			.filter(attachment => attachment.link !== ''),
	};
};

// Example data
// viewDoor(cn, dn, dt, dst, dd, df, dw, dh, fid, inningno, astatus)

// 기초프로그래밍II 유투브 강의 2개
// viewDoor(36463,71897, 0, 0, 'https://youtu.be/-m_x6xyowvQ', 0, 560, 315, 'frmpop');
// viewDoor(36463,71994, 0, 0, 'https://youtu.be/Z6TjsQ_j9ZY', 0, 560, 315, 'frmpop');

// ICT융합기술론 PPT 자료
// viewDoor(36299,66770, 1, 5, '', 1632456, 560, 315, 'frmpop');
// viewDoor(36299,71312, 1, 5, '', 1674655, 560, 315, 'frmpop');

// 비주얼프로그래밍 자체 동영상 플레이어 (재생기록 X)
// viewDoor(36713,73268, 0, 3, '', 1690422, 1280, 720, 'frmpop');
// viewDoor(36713,70701, 0, 3, '', 1668171, 1280, 720, 'frmpop');
// viewDoor(36713,70702, 0, 3, '', 1668179, 1280, 720, 'frmpop');

// 부산과세계 온라인강의 자체 동영상 플레이어 (재생기록 O)
// javascript:viewDoor(34300,557, 0, 2, '', 0, 560, 315, 'frmpop', 436049, 'CLAT001');
// javascript:viewDoor(34300,563, 0, 2, '', 0, 560, 315, 'frmpop', 436055, 'CLAT001');

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const parseViewDoorFunction = (func: string) => {
	const params = (func.match(/viewDoor\((?<params>.*)\)/)?.groups?.params || '').split(',').map(d => d.replaceAll("'", '').trim());

	const DoorType = {
		// 도어 내부에서 제공되는 경우 (url이 door.deu.ac.kr인 경우)
		BUILTIN: '0',
		// 외부 링크인 경우
		EXTERNAL: '1',
	};

	const Destination = {
		UNKNOWN_0: '0',
		UNKNOWN_2: '2',
		UNKNOWN_3: '3',
		FILE: '5',
	};

	const namedParams = {
		courseId: params[0],
		doorId: params[1],
		doorType: params[2] as keyof typeof DoorType,
		destination: params[3] as keyof typeof Destination,
		externalLink: decodeURIComponent(params[4]),
		fileId: params[5],
		doorWidth: params[6],
		doorHeight: params[7],
		fid: params[8] || 'frmpop',
		inningno: params[9] || 0,
		astatus: params[10],
	};

	let link =
		namedParams.doorType === DoorType.BUILTIN
			? // Using built-in video player. (whether the type is online or offline)
			  namedParams.destination === Destination.UNKNOWN_0
				? namedParams.externalLink
				: `/Door/DoorView?DoorNo=${namedParams.doorId}&CoursesNo=${namedParams.courseId}&InningNo=${namedParams.inningno}`
			: // Using external link or file.
			namedParams.destination === Destination.FILE
			? `/common/filedownload/${namedParams.fileId}`
			: namedParams.destination === Destination.UNKNOWN_0
			? namedParams.externalLink
			: '';

	// Default link is door.deu.ac.kr
	if (link.startsWith('/')) link = 'http://door.deu.ac.kr' + link;

	const parser = new YouTubeURLParser(link);

	if (parser.isValid()) link = parser.getEmbeddingURL() || link;

	const result: {
		doorId: string;
		link: string;
		historyLink: ILink;
	} = {
		doorId: namedParams.doorId,
		link: link,
		historyLink: {
			url: '/Door/DoorViewHistory',
			method: 'POST',
			data: {
				DoorNo: namedParams.doorId,
				CourseNo: namedParams.courseId,
			},
		},
	};

	return result;
};
