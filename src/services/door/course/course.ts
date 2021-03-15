import { ICourse, ITerm } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseTableElement } from '../util';

export async function getCourses(params: Pick<ITerm, 'id'> & Partial<ITerm>): Promise<Response<ICourse[]>> {
	const { id: termId } = params;

	const document = parse((await driver.get(`/MyPage${termId !== undefined ? `?termNo=${termId}` : ''}`)).data);

	const courseTable = document.querySelector('#wrap > div.subpageCon > div:nth-child(3) > div:nth-child(3) > table');

	if (!(courseTable instanceof HTMLTableElement))
		throw new UnauthorizedError('강의 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	// Schema of Course table is:
	/**
	 * 강의실: "",
	 * 강의형태: "오프라인",
	 * 교과목: "컴퓨터적사고키우기",
	 * 구분: "균형교양",
	 * 담당교수: "홍길동",
	 * 분반: "1",
	 * 진도율: "0/13"
	 * 학기: "2020 / 2"
	 */
	const courses = parseTableElement(courseTable)
		.map(course => {
			return {
				termId,
				// javascript:goRoom('36190', 'CHGB001')
				id: course['교과목']?.url?.match(/goRoom\('(\w+)', ?'\w+'\)/)?.[1] || '',
				name: course['교과목'].text,
				type: course['구분'].text,
				professor: course['담당교수'].text,
				division: course['분반'].text,
			};
		})
		.filter(course => course.id !== '');

	return {
		data: courses,
	};
}
