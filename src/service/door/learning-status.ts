import { fulfilledFetchable, ID } from "./interfaces";
import { LearningStatus } from "./interfaces/learning-status";
import { doorAxios, parseTableElement } from "./util";
import cheerio from 'cheerio';

export async function getLearningStatus(courseId: ID): Promise<LearningStatus> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseLectureInfo/${courseId}`)).data);

	const statusTable = document('#wrap > div.subpageCon > div:nth-child(5) > div.form_table > table').toArray().shift();

	if(!statusTable) throw new Error('수업 진행 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const learningStatus: LearningStatus = {
		courseId,

		list: parseTableElement(statusTable).map(row => ({
			title: row['콘텐츠명'].text,
			week: Number(row['주차'].text),
			order: Number(row['순서'].text),
			read: row['조회'].text === 'O'
		})),

		...fulfilledFetchable()
	};

	return learningStatus;
}