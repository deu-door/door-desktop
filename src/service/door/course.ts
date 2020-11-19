import cheerio from 'cheerio';
import { FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Course } from './interfaces/course';
import { doorAxios, parseInformaticTableElement, parseTableElement } from './util';

export async function getCourses(): Promise<FetchableMap<Course>>{
	const document = cheerio.load((await doorAxios.get('/MyPage')).data);

	const courseTable = document(`#wrap > div.subpageCon > div:nth-child(3) > div:nth-child(3) > table`).toArray().shift();

	if(!courseTable) throw new Error('강의 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

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
	const courseList = parseTableElement(courseTable);

	return {
		items: Object.fromEntries(courseList.map(course => {
			// javascript:goRoom('36190', 'CHGB001')
			const id = course['교과목']?.url?.match(/goRoom\('(\w+)', ?'\w+'\)/)?.[1];

			return [id, {
				id: id,
				name: course['교과목'].text,
				type: course['구분'].text,
				professor: course['담당교수'].text,
				division: course['분반'].text,

				...notFulfilledFetchable()
			} as Course];
		})),

		...fulfilledFetchable()
	};
}

/**
 * @param prevCourse Course.id 기반으로 구체적인 정보를 얻습니다.
 * 
 * @returns 인자로 주어진 Course의 id와 Course의 추가 정보를 반환합니다.
 */
export async function getCourseDetail(id: ID): Promise<Course> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseLetureDetail/${id}`)).data);

	// 수업계획 (수업계획서)
	const descriptionTable = document(`#wrap > div.subpageCon > div:nth-child(5) > div:nth-child(3) > table`).toArray().shift();

	// 수업평가방법 (수업계획서)
	const ratesTable = document(`#wrap > div.subpageCon > div:nth-child(5) > div:nth-child(5) > table:nth-child(1)`).toArray().shift();

	// 주차별 강의계획
	const scheduleTable = document(`#wrap > div.subpageCon > div:nth-child(5) > div.form_table > table`).toArray().shift();

	if(!descriptionTable || !ratesTable || !scheduleTable) throw new Error('강의 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const description = parseInformaticTableElement(descriptionTable);

	const rates = parseTableElement(ratesTable).find(row => row['평가항목'].text === '비율');

	const schedule = parseTableElement(scheduleTable);

	return {
		id: id,

		name: description['교과목명'].text,
		// NOTE: Door 메인에서 이수구분과 수업계획서의 이수구분이 다를 수 있음
		// type: description['이수구분'].text,
		major: description['주관학과'].text,
		target: description['대상학년'].text,
		credits: Number(description['학점/시간'].text.split('/')[0].trim()),
		hours: Number(description['학점/시간'].text.split('/')[1].trim()),
		professor: description['담당교원'].text,
		contact: description['연락처/이메일'].text.split('/')[0].trim(),
		email: description['연락처/이메일'].text.split('/')[1].trim(),
		description: description['교과목개요'].text,
		goal: description['교과 교육목표'].text,
		book: description['주교재'].text,

		rates: rates ? {
			midterm: Number(rates['중간고사'].text),
			finalterm: Number(rates['기말고사'].text),
			quiz: Number(rates['퀴즈'].text),
			assignment: Number(rates['과제'].text),
			teamProject: Number(rates['팀PJ'].text),
			attendance: Number(rates['출석'].text),
			etc1: Number(rates['기타1'].text),
			etc2: Number(rates['기타2'].text),
			etc3: Number(rates['기타3'].text),
			presentation: Number(rates['발표'].text),
			participation: Number(rates['참여도'].text)
		} : undefined,

		// schedule: schedule ? Object.fromEntries(schedule.map(row => {
		// 	const schedule: CourseSchedule = {
		// 		week: row['주차'].text,
		// 		from: new Date(row['출석기간'].text.split('~')[0].trim()),
		// 		to: new Date(row['출석기간'].text.split('~')[1].trim()),
		// 		contents: row['강의내용'].text,
		// 		remark: row['과제/비고'].text
		// 	};

		// 	return [schedule.week, schedule];
		// })) : undefined,

		...fulfilledFetchable()
	} as Course;
}
