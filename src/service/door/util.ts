import { Attachment, Submission } from "./interfaces";
import cheerio from 'cheerio';

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
		const td = $(th).next().toArray().pop();
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

	const contents = tableParsed['제출 내용'].text;
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
