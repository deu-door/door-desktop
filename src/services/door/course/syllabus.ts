import { ICourse, ICourseSyllabus, ICourseTime, ResourceID } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseInformaticTableElement, parseTableElement } from '../util';

/**
 * @param prevCourse Course.id 기반으로 구체적인 정보를 얻습니다.
 *
 * @returns 인자로 주어진 Course의 id와 Course의 추가 정보를 반환합니다.
 */
export async function getCourseSyllabus(params: { id: ResourceID } & Partial<ICourse>): Promise<Response<ICourseSyllabus>> {
	const { id } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseLetureDetail/${id}`)).data);

	// 수업계획 (수업계획서)
	const descriptionTable = document.querySelector('#wrap > div.subpageCon > div:nth-child(5) > div:nth-child(3) > table');

	// 수업평가방법 (수업계획서)
	const ratesTable = document.querySelector('#wrap > div.subpageCon > div:nth-child(5) > div:nth-child(5) > table:nth-child(1)');

	// 주차별 강의계획
	const scheduleTable = document.querySelector('#wrap > div.subpageCon > div:nth-child(5) > div.form_table > table');

	if (
		!(
			descriptionTable instanceof HTMLTableElement &&
			ratesTable instanceof HTMLTableElement &&
			scheduleTable instanceof HTMLTableElement
		)
	)
		throw new UnauthorizedError('강의 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const description = parseInformaticTableElement(descriptionTable);

	const rates = parseTableElement(ratesTable).find(row => row['평가항목'].text === '비율') ?? {};

	//const schedule = parseTableElement(scheduleTable);

	return {
		data: {
			//id: courseId,

			//name: description['교과목명'].text,
			// NOTE: Door 메인에서 이수구분과 수업계획서의 이수구분이 다를 수 있음
			// type: description['이수구분'].text,
			major: description['주관학과'].text,
			target: parseInt(description['대상학년'].text),
			credits: Number(description['학점/시간'].text.split('/')[0].trim()),
			hours: Number(description['학점/시간'].text.split('/')[1].trim()),
			//professor: description['담당교원'].text,
			contact: description['연락처/이메일'].text.split('/')[0].trim(),
			email: description['연락처/이메일'].text.split('/')[1].trim(),
			description: description['교과목개요'].text,
			goal: description['교과 교육목표'].text,
			times: description['강의실(시간)'].text
				.split(',')
				.map(timeText => timeText.trim())
				.map(timeText => {
					const matches = timeText.match(/([가-힣\w]+)\[([월화수목금토일])(\d)(?:-(\d))?\]/);

					if (matches === null) return undefined;

					const start = Number(matches[3]);
					const end = Number(matches[4] ?? start);

					return {
						room: matches[1],
						day: matches[2],
						times: [...Array(end - start + 1).keys()].map(i => i + start),
					};
				})
				.filter((time): time is ICourseTime => time !== undefined),

			book: description['주교재'].text,

			rateInfo: {
				midterm: Number(rates['중간고사'].text),
				finalterm: Number(rates['기말고사'].text),
				quiz: Number(rates['퀴즈'].text ?? 0),
				assignment: Number(rates['과제'].text),
				teamProject: Number(rates['팀PJ'].text),
				attendance: Number(rates['출석'].text),
				etc1: Number(rates['기타1'].text),
				etc2: Number(rates['기타2'].text),
				etc3: Number(rates['기타3'].text),
				presentation: Number(rates['발표'].text),
				participation: Number(rates['참여도'].text),
			},

			// schedule: schedule ? Object.fromEntries(schedule.map(row => {
			// 	const schedule: CourseSchedule = {
			// 		week: row['주차'].text,
			// 		from: new Date(row['출석기간'].text.split('~')[0].trim()),
			// 		to: new Date(row['출석기간'].text.split('~')[1].trim()),
			// 		contents: row['강의내용'].text,
			// 		remark: row['과제/비고'].text
			// 	};

			// TODO: implement this. currently empty
			weeks: [],

			// 	return [schedule.week, schedule];
			// })) : undefined,
		},
	};
}
