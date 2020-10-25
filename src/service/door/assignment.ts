import cheerio from 'cheerio';
import { doorAxios, parseTableElement } from '.';
import { FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Assignment } from './interfaces/assignment';

export async function getAssignment(courseId: ID, id: ID): Promise<Assignment> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`)).data);

	const table = document(`#sub_content2 > div:nth-child(1) > table`);

	if(!table) throw new Error(`Cannot fetch Assignment. Please check login status.`);

	const assignment = { id: id } as Assignment;

	const contents = table.find(`tbody > tr:nth-child(4) > td`).text().trim();
	if(contents) assignment.contents = contents;

	const attachment = table.find(`tbody > tr:nth-child(5) > td`).text().trim();
	if(attachment) assignment.attachment = attachment;

	return {
		...assignment,

		...fulfilledFetchable()
	};
}

export async function getAssignments(courseId: ID): Promise<FetchableMap<Assignment>> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseHomeworkStudentList/${courseId}`)).data);

	const table = document(`#sub_content2 > div > table`).toArray().pop();

	if(!table) throw new Error(`Cannot fetch Assignment List. Please check login status.`);

	/**
	 * 주차-차시: "1-1",
	 * 과제유형: "개인과제",
	 * 과제제목: "[1주차] 실습과제 제출",
	 * 제출기간: "20-09-01 10:00~20-09-01 11:59",
	 * 제출여부: "제출",
	 * 점수: ""
	 */	
	const assignments = parseTableElement(table).map(assignment => ({
		id: assignment['과제제목'].url?.match(/HomeworkNo=(\w+)/)?.[1],
		title: assignment['과제제목'].text,
		type: assignment['과제유형'].text,
		period: {
			// TODO: Date Format이 변경되어도 유연한 처리가 될 수 있도록
			// Boilerplate가 필요
			from: new Date('20' + assignment['제출기간'].text.split('~')[0]),
			to: new Date('20' + assignment['제출기간'].text.split('~')[1])
		},
		achieved: assignment['제출여부'].text === '제출',

		...notFulfilledFetchable()
	} as Assignment));

	return {
		items: Object.fromEntries(assignments.map(assignment => [assignment.id, assignment])),

		...fulfilledFetchable()
	};
}