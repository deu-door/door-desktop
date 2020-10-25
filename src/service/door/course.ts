import cheerio from 'cheerio';
import { doorAxios, parseTableElement } from '.';
import { FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Course } from './interfaces/course';

export async function getCourses(): Promise<FetchableMap<Course>>{
	const document = cheerio.load((await doorAxios.get('/MyPage')).data);

	const courseTable = document(`#wrap > div.subpageCon > div:nth-child(3) > div:nth-child(3) > table`).toArray().pop();

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
	const detail = document(`#wrap > div.subpageCon > div:nth-child(5) > div:nth-child(3) > table`);

	// 수업평가방법 (수업계획서)
	const rates = document(`#wrap > div.subpageCon > div:nth-child(5) > div:nth-child(5) > table:nth-child(1)`);

	// 주차별 강의계획
	const schedule = document(`#wrap > div.subpageCon > div:nth-child(5) > div.form_table > table`).toArray().pop();

	if(!detail || !rates || !schedule) throw new Error('강의 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const course = { id } as Course;

	// 학점/시간
	const creditsAndHours = detail.find(`tbody > tr:nth-child(2) > td:nth-child(2)`).text().match(/([\d.]+) ?\/ ?(\d+)/);
	const credits = Number(creditsAndHours?.[1]);
	const hours = Number(creditsAndHours?.[2]);
	if(!isNaN(credits)) course.credits = credits;
	if(!isNaN(hours)) course.hours = hours;

	// 연락처 및 이메일
	const contactAndEmail = detail.find(`tbody > tr:nth-child(4) > td:nth-child(4)`).text().match(/(w+) ?\/ ?(\w+)/);
	const contact = contactAndEmail?.[1];
	const email = contactAndEmail?.[2];
	if(contact) course.contact = contact;
	if(email) course.email = email;

	// 교과목개요
	const description = detail.find(`tbody > tr:nth-child(5) > td`).text();
	if(description) course.description = description;

	// 교과 교육목표
	const goal = detail.find(`tbody > tr:nth-child(6) > td`).text();
	if(goal) course.goal = goal;

	// 주교재
	const book = detail.find(`tbody > tr:nth-child(8) > td`).text();
	if(book) course.book = book;

	// 주차별 강의계획
	course.schedule = Object.fromEntries(parseTableElement(schedule).map(row => [
		row['주차'],
		{
			id: row['주차'].text,
			from: new Date(row['출석기간'].text.split('~')[0]),
			to: new Date(row['출석기간'].text.split('~')[1]),
			contents: row['강의내용'].text,
			remark: row['과제/비고'].text
		}
	]));

	return {
		...course,
		...fulfilledFetchable()
	};
}
