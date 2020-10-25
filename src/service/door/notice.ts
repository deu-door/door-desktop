import cheerio from 'cheerio';
import { doorAxios, parseTableElement } from '.';
import { FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Notice } from './interfaces/notice';

export async function getNotice(id: ID): Promise<Notice> {
	const document = cheerio.load((await doorAxios.get(`/BBS/Board/Detail/CourseNotice/${id}`)).data);

	const table = document(`#boardForm > div.form_table > table`);

	if(!table) throw new Error('공지사항을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const notice = { id } as Notice;

	const createdAt = new Date(table.find(`tbody > tr:nth-child(2) > td:nth-child(4)`).text());
	if(!isNaN(createdAt.getTime())) notice.createdAt = createdAt;

	const contents = table.find(`tbody > tr:nth-child(4) > td`).html();
	if(contents) notice.contents = contents;

	return {
		...notice,

		...fulfilledFetchable()
	};
}

export async function getNotices(courseId: ID): Promise<FetchableMap<Notice>> {
	const document = cheerio.load((await doorAxios.get(`/BBS/Board/List/CourseNotice?cNo=${courseId}`)).data);

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
