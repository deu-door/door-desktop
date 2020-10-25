import cheerio from 'cheerio';
import { doorAxios, parseTableElement } from '.';
import { FetchableMap, fulfilledFetchable, ID, Identifiable } from './interfaces';
import { Lecture } from './interfaces/lecture';

export async function getLecturesByWeek(courseId: ID, week: string|number): Promise<FetchableMap<Lecture>> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/DoorWeekDoors/${courseId}?w=${week}`)).data);

	const lectures = document(`#subDoorListCon div.listItem`).toArray().map(lecture => ({
		id: document(`a[title=바로보기]`, lecture).attr('onclick')
			?.match(/viewDoor\( ?\w+ ?, ?(\w+)/)?.[1],

		title: document(`.lt_title > span`, lecture).text(),

		description: document(`.lt_desc`, lecture).text(),

		// viewDoor(36463,48387, 0, 0, 'https://youtu.be/8oE95UHaTzo', 0, 560, 315, 'frmpop');
		url: document(`a[title=바로보기]`, lecture).attr('onclick')
			?.match(/viewDoor\( ?\w+ ?, ?\w+ ?, ?\w+ ?, ?\w+ ?, ?'([\w+:/.?=&]+)'/)?.[1],

		// 자바, 상속, 프로그래밍
		tags: document(`.lt_tag`, lecture).text().split(/ ?, ?/).map(d => d.trim()),

		week: week,

		...fulfilledFetchable()
	} as Lecture));

	return {
		items: Object.fromEntries(lectures.map(lecture => [lecture.id, lecture])),

		...fulfilledFetchable()
	};
}

export async function getLectures(courseId: ID): Promise<FetchableMap<FetchableMap<Lecture>>> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/DoorWeeks/${courseId}`)).data);

	const table = document(`#mainForm > div > table`).toArray().pop();

	if(!table) throw new Error('온라인 강의 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	/**
	 * 주차: "1",
	 * 주제: "과목소개 및 강의 개요",
	 * 수업기간: "09-01 ~ 09-07",
	 * DOOR: 3,
	 * 조회: 35,
	 * 의견: 0
	 */
	const lecturesByWeekTable = parseTableElement(table);

	// 주차 별 강의 개수와 비교하여 개수가 틀리다면
	// 해당 주차의 강의 목록 다시 fetch
	// const lecturesByWeek = (course.lectures?.items || []).reduce((a: { [key: string]: Lecture[] }, c: Lecture) => {
	// 	a[c.week] = a[c.week] || [];
	// 	a[c.week].push(c);
	// 	return a;
	// }, {});

	const weeks = lecturesByWeekTable.map(row => ({
		id: row['주차'].text,
		items: {},

		...fulfilledFetchable()
	} as FetchableMap<Lecture> & Identifiable));

	// const needsFetch = lecturesByWeekTable.filter(row => {
	// 	// 저장된 강의 개수와 홈페이지에 등록된 강의 개수가 다르면 fetch
	// 	if(lecturesByWeek[row['주차'].text] || '0' !== row['DOOR'].text) return true;

	// 	return false;
	// }).map(row => row['주차'].text);

	// TODO: 기존 강의와 비교 후 추가된 것만 삽입하는 코드 추가 필요.
	// 지금은 주차별 강의가 2개에서 3개로 늘어날 시 기존에 있던 2개도 새 것으로 교체됨.
	// for(let week of needsFetch){
	// 	lecturesByWeek[week] = await getLecturesByWeek(course, week);
	// }

	// 주차별로 분류하였던 Lecture 목록을 전부 취합하여 반환
	return {
		items: Object.fromEntries(weeks.map(week => [week.id, week])),

		...fulfilledFetchable()
	};
}