import { ICourse } from 'models/door';
import { ILectureProgress } from 'models/door/lecture/lecture-progress';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseTableElement } from '../util';

export async function getLectureProgresses(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<ILectureProgress[]>> {
	const { id: courseId } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseLectureInfo/${courseId}`)).data);

	const learningProgressTable = document.querySelector('#gvListTB');

	if (!(learningProgressTable instanceof HTMLTableElement)) {
		throw new UnauthorizedError('학습현황 정보를 가져올 수 없습니다. 로그인 상태를 확인해주세요.');
	}

	const lectureProgresses: ILectureProgress[] = parseTableElement(learningProgressTable).map(row => ({
		courseId,

		week: Number(row['주차'].text),
		period: Number(row['차시'].text),

		type: row['수업형태'].text as ILectureProgress['type'],

		// parse later
		attendance: '수업없음',

		length: Number(row['학습시간(분)'].text.split('/')[1]),
		current: Number(row['학습시간(분)'].text.split('/')[0]),

		views: Number(row['강의접속수'].text),

		startedAt: row['최초학습일'].text.trim().length > 0 ? new Date(row['최초학습일'].text).toISOString() : undefined,
		finishedAt: row['학습완료일'].text.trim().length > 0 ? new Date(row['학습완료일'].text).toISOString() : undefined,
		recentViewedAt: row['최근학습일'].text.trim().length > 0 ? new Date(row['최근학습일'].text).toISOString() : undefined,
	}));

	return {
		data: lectureProgresses,
	};
}
