import cheerio from 'cheerio';
import { doorAxios, parseInfomaticTableElement, parseTableElement } from '.';
import { Attachment, FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Notice } from './interfaces/notice';

export async function getNotice(courseId: ID, id: ID): Promise<Notice> {
	const document = cheerio.load((await doorAxios.get(`/BBS/Board/Detail/CourseNotice/${id}`)).data);

	const detailTable = document(`#boardForm > div.form_table > table`).toArray().pop();

	if(!detailTable) throw new Error('공지사항을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const detail = parseInfomaticTableElement(detailTable);

	const attachments: Attachment[] = [];

	cheerio.load(detail['첨부파일'].element)('a').toArray().forEach(file => {
		const fileElement = cheerio.load(file)('');

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

export async function getNotices(courseId: ID): Promise<FetchableMap<Notice>> {
	const document = cheerio.load((await doorAxios.get(`/BBS/Board/List/CourseNotice?cNo=${courseId}&pageRowSize=200`)).data);

	const table = document(`#sub_content2 > div.form_table > table`).toArray().pop();

	if(!table) throw new Error('공지사항을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	/**
	 * 번호: "알림" | "2",
	 * 읽음: "",
	 * 제목: "실시간 ZOOM 수업 안내",
	 * 작성자: "홍길동",
	 * 등록일: "2020-09-15",
	 * 조회: 32
	 */
	const notices = parseTableElement(table).map(notice => ({
		id: notice['제목'].url?.match(/CourseNotice\/(\w+)?/)?.[1],
		courseId: courseId,

		author: notice['작성자'].text,
		createdAt: new Date(notice['등록일'].text),
		title: notice['제목'].text,
		views: Number(notice['조회'].text),

		...notFulfilledFetchable()
	} as Notice));

	return {
		items: Object.fromEntries(notices.map(notice => [notice.id, notice])),

		...fulfilledFetchable()
	};
}
