import { YouTubeURLParser } from '@iktakahiro/youtube-url-parser';
import moment from 'moment';
import { driver, parse, parseTableElement, parseViewDoorFunction } from '../util';
import { ILink, IDoor, IDoorPost, ICourse, PostVariant, IDoorPostHead } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';

export async function getDoorPosts(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<IDoorPostHead[]>> {
	const { id: courseId } = params;

	const lecturesDocument = parse((await driver.get(`/LMS/LectureRoom/DoorWeeks/${courseId}`)).data);

	const detailDocument = parse((await driver.get(`/LMS/LectureRoom/CourseLetureDetail/${courseId}`)).data);

	const lecturesTable = lecturesDocument.querySelector('#mainForm > div > table');

	const detailTable = detailDocument.querySelector('#wrap > div.subpageCon > div:nth-child(5) > div.form_table > table');

	if (!(lecturesTable instanceof HTMLTableElement && detailTable instanceof HTMLTableElement))
		throw new UnauthorizedError('온라인 강의 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const lecturesByWeek = parseTableElement(lecturesTable);

	const detail = Object.fromEntries(parseTableElement(detailTable).map(row => [row['주차'].text, row]));

	const doorPosts: IDoorPostHead[] = lecturesByWeek.map(row => {
		const week = row['주차'].text;

		const from = moment(detail[week]['출석기간'].text.split('~')[0].trim()).startOf('days').toDate().toISOString();
		const to = moment(detail[week]['출석기간'].text.split('~')[1].trim()).endOf('days').toDate().toISOString();

		return {
			variant: PostVariant.door,

			id: week,
			courseId: courseId,

			week: Number(week),
			// TODO: fix properly
			period: 1,
			title: row['주제'].text,
			remark: detail[week]['과제/비고'].text,

			views: Number(row['조회'].text),
			registeredDoorsCount: Number(row['DOOR'].text),

			createdAt: from,
			duration: { from, to },

			partial: true,
		};
	});

	return {
		data: doorPosts,
	};
}

export async function getDoorPost(
	params: Pick<IDoorPost, 'id' | 'courseId'> & Partial<IDoorPost>,
): Promise<Response<Omit<IDoorPost, 'period' | 'views' | 'registeredDoorsCount'>>> {
	const { id, courseId } = params;

	return {
		data: {
			variant: PostVariant.door,

			id,
			courseId,

			doors: (await getDoors(params)).data,

			partial: false,
		} as IDoorPost,
	};
}

export async function getDoors(params: Pick<IDoorPost, 'courseId' | 'id'> & Partial<IDoorPost>): Promise<Response<IDoor[]>> {
	const { courseId, id: week } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/DoorWeekDoors/${courseId}?w=${week}`)).data);

	const lectures = Array.from(document.querySelectorAll<HTMLElement>('#subDoorListCon div.listItem')).map(lectureElement => {
		const viewDoor = parseViewDoorFunction(lectureElement.querySelector('a[title=바로보기]')?.getAttribute('onclick') || '');

		return {
			variant: PostVariant.door,

			id: viewDoor.doorId,
			courseId: courseId,
			week: Number(week),

			title: lectureElement.querySelector<HTMLElement>('.lt_title > span')?.innerText || '',
			contents: lectureElement.querySelector<HTMLElement>('.lt_desc')?.innerText || '',
			createdAt: new Date(
				lectureElement.querySelector<HTMLElement>('.lt_info')?.innerText.match(/\d+\.\d+\.\d+/)?.[0] || '',
			).toISOString(),
			views: Number(lectureElement.querySelector<HTMLElement>('.lt_info')?.innerText.match(/조회\((\d+)\)/)?.[1]),

			link: viewDoor.link,
			historyLink: viewDoor.historyLink,

			tags:
				lectureElement
					.querySelector<HTMLElement>('.lt_tag')
					?.innerText.split(/ ?, ?/)
					.map(d => d.trim()) || [],

			attachments: [],

			partial: false,
		};
	});

	return {
		data: lectures,
	};
}
