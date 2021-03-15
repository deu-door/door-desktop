import { ICourse, ILecture } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseTableElement, parseViewDoorFunction } from '../util';

const parseImageText = (src: string) => {
	switch (src) {
		case '/Content/images/common/BT_LecRoom01_01.gif':
			return '시험';
		case '/Content/images/common/BT_LecRoom01_02.gif':
			return '강의';
		case '/Content/images/common/BT_LecRoom01_03.gif':
			return '공지';
		case '/Content/images/common/BT_LecRoom01_04.gif':
			return '출제';
		case '/Content/images/common/BT_LecRoom01_05.gif':
			return '미수강';
		case '/Content/images/common/BT_LecRoom01_06.gif':
			return '휴강';
		case '/Content/images/common/BT_LecRoom01_07.gif':
			return '강의';
		case '/Content/images/common/BT_LecRoom01_08.gif':
			return '대면';
		case '/Content/images/common/BT_LecRoom01_09.gif':
			return '미등록';
		case '/Content/images/common/BT_LecRoom01_10.gif':
			return '다운로드';
		case '/Content/images/common/icon_LecRoom02_01.gif':
			return '결석';
		case '/Content/images/common/icon_LecRoom02_02.gif':
			return '완료전';
		case '/Content/images/common/icon_LecRoom02_03.gif':
			return '출석';
		case '/Content/images/common/icon_LecRoom02_04.gif':
			return '지각';
	}
	return '-';
};

const getDoorLink = (onclick: string) => {
	if (!/viewDoor/.test(onclick)) return {};

	const viewDoor = parseViewDoorFunction(onclick);

	if (viewDoor.link) return viewDoor;

	return {
		link: undefined,
		historyLink: undefined,
		doorId: undefined,
	};
};

export async function getLectures(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<ILecture[]>> {
	const { id: courseId } = params;

	const document = parse((await driver.get(`/LMS/StudyRoom/Index/${courseId}`)).data);

	const table = document.querySelector('table#gvListTB');

	if (!(table instanceof HTMLTableElement))
		throw new UnauthorizedError('온라인강의 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const lectures: ILecture[] = parseTableElement(table).map(row => {
		return {
			courseId,

			week: Number(row['주차'].text),
			period: Number(row['차시'].text),
			title: row['강의주제'].element.querySelector('a')?.innerText.trim() || '',
			type: parseImageText(row['수업 형태'].element.querySelector('img')?.getAttribute('src') || ''),
			duration: {
				// TODO: implement moment based parse
				from: row['수업기간'].text.split(' ~ ')[0],
				to: row['수업기간'].text.split(' ~ ')[1],
			},
			length: Number(row['학습시간(분)'].text),
			attendance: parseImageText(row['출결상태'].element.querySelector('img')?.getAttribute('src') || ''),

			...getDoorLink(row['강의주제'].element.querySelector('a')?.getAttribute('onclick') || ''),
		};
	});

	return {
		data: lectures,
	};
}
