import { Attachment, Submission } from "./interfaces";
import cheerio from 'cheerio';
import axios from 'axios';
import qs from 'qs';

/**
 * Axios 객체. door 홈페이지 요청에 대해 맞춤 설정되어 있음
 */
export const doorAxios = axios.create({
	baseURL: 'http://door.deu.ac.kr',
	headers: {
		// 기본 Accept 헤더는 application/json, text/plain, */* 이렇게 되어있는데
		// 기본 값으로 사용시 서버 측에서 500 Internal 에러 발생
		// IMPORTANT: Accept 헤더는 반드시 */* 로 해야됨
		'Accept': '*/*',
		// 서버 측에선 application/x-www-form-urlencoded 외엔 인식하지 못함
		'Content-Type': 'application/x-www-form-urlencoded'
	},
	transformRequest: [
		(data, headers) => qs.stringify(data, { arrayFormat: 'brackets' })
	],
	withCredentials: true,
	validateStatus: status => status >= 200 && status <= 302
});

// Logging request
doorAxios.interceptors.request.use(request => {
	console.log('[Axios] Starting Request', request);
	return request;
});

// Logging response
doorAxios.interceptors.response.use(response => {
	console.log('[Axios] Receive Response', response);
	return response;
});

// delayed all request (0.8s)
// doorAxios.interceptors.request.use(async request => {
// 	await new Promise(resolve => setTimeout(() => resolve(), 100));
// 	return request;
// });

interface Cell { [key: string]: { text: string, url: string|undefined, element: cheerio.Element } }

/**
 * HTML 테이블 Element를 Cheerio를 사용하여 배열로 파싱합니다.
 * 
 * @param table 파싱할 테이블 cheerio.Element입니다.
 */
export function parseTableElement(table: cheerio.Element): Array<Cell>{
	const $ = cheerio.load(table);
	let rows = $('tbody tr').toArray().map(tr => {
		// tbody이어도 th 태그가 포함될 수 있음 (서버 단에서 그렇게 하기 때문)
		return $('td,th', tr).toArray().map(td => ({
			text: $(td).text().trim(),
			url: $('*[href]', td).attr('href'),
			element: td
		}));
	});
	
	// <thead> 에서 <th> 태그 수집
	let headers: string[] = $('thead tr th').toArray().map(th => $(th).text());

	// <thead> 에서 <td> 태그 수집
	if(headers.length === 0) headers = $('thead tr td').toArray().map(th => $(th).text());
	
	// <thead> 대신 <tbody> 에서 첫 번째 row 사용
	if(headers.length === 0) headers = rows.shift()?.map(d => d.text) || [];

	// 헤더의 갯수와 데이터 필드의 개수가 일치하지 않으면 Filter
	// Door 홈페이지에서, 게시물이 하나도 없을 경우 <td colspan="9">등록된 과제가 없습니다.</td> 를 띄우는데,
	// 이를 필터링하기 위함
	rows = rows.filter(row => row.length === headers.length);

	console.log(headers, rows);

	return rows.map(row => {
		const newRow: Cell = {};
		headers.forEach((header, index) => {
			newRow[header] = row[index];
		});
		return newRow;
	});
}

/**
 * HTML 테이블 Element를 Cheerio를 사용하여 Object로 파싱합니다.
 * 
 * @param table 파싱할 테이블 cheerio.Element입니다.
 */
export function parseInformaticTableElement(table: cheerio.Element): Cell {
	const $ = cheerio.load(table);
	const data: Cell = {};
	
	$('tbody th').toArray().forEach(th => {
		const td = $(th).next().toArray().shift();
		if(td?.name !== 'td') return;

		data[$(th).text().trim()] = {
			text: $(td).text().trim(),
			url: $('*[href]', td).attr('href'),
			element: td
		};
	});

	return data;
}

export const parseSubmission = (table: cheerio.Element): Submission => {
	const $ = cheerio.load(table);
	const tableParsed = parseInformaticTableElement(table);

	const contents = (tableParsed['제출 내용'] || tableParsed['제출내용']).text;
	const attachments: Attachment[] = [];
	
	$('.filelist .fileitembox a[title=다운로드]', tableParsed['첨부파일'].element).toArray().forEach(file => {
		const fileElement = $(file);

		const attachment: Attachment = {
			title: fileElement.text().trim(),
			link: fileElement.attr('href') || ''
		};

		if(attachment.link) attachments.push(attachment);
	});

	return {
		contents,
		attachments,
		submitted: contents.length > 0 || attachments.length > 0
	};
}
