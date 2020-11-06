import cheerio from 'cheerio';
import { doorAxios, parseInfomaticTableElement, parseTableElement } from '.';
import { Attachment, FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Reference } from './interfaces/reference';

export async function getReference(courseId: ID, id: ID): Promise<Reference> {
	// /BBS/Board/Read 로 요청을 보내면 서버 자체적으로 "읽음" 처리된 후 /BBS/Board/Detail로 리다이렉트됨
	const document = cheerio.load((await doorAxios.get(`/BBS/Board/Read/CourseReference/${id}`)).data);

	const detailTable = document(`#boardForm > div.form_table > table`).toArray().pop();

	if(!detailTable) throw new Error('강의자료를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const detail = parseInfomaticTableElement(detailTable);

	const attachments: Attachment[] = [];

	document(detail['첨부파일'].element).find('a').toArray().forEach(file => {
		const fileElement = document(file);

		const attachment: Attachment = {
			title: fileElement.text().trim(),
			link: fileElement.attr('href') || ''
		};

		if(attachment.link) attachments.push(attachment);
	});

	return {
		id: id,
		courseId: courseId,

		title: detail['제목'].text,
		author: detail['작성자'].text,
		createdAt: new Date(detail['등록일'].text),
		views: Number(detail['조회'].text),
		contents: document(detail['내용'].element).html() || '',

		attachments: attachments,

		...fulfilledFetchable()
	};
}

export async function getReferences(courseId: ID): Promise<FetchableMap<Reference>> {
	const document = cheerio.load((await doorAxios.get(`/BBS/Board/List/CourseReference?cNo=${courseId}&pageRowSize=200`)).data);

	const table = document(`#sub_content2 > div.form_table > table`).toArray().pop();

	if(!table) throw new Error('강의자료 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');
	
	const references: Reference[] = parseTableElement(table).map(row => ({
		id: row['제목'].url?.match(/CourseReference\/(\d+)/)?.[1] || '',
		courseId: courseId,

		author: row['작성자'].text,
		createdAt: new Date(row['등록일'].text),
		title: row['제목'].text,
		views: Number(row['조회'].text),

		...notFulfilledFetchable()
	}));

	return {
		items: Object.fromEntries(references.map(reference => [reference.id, reference])),

		...fulfilledFetchable()
	};
}
