import cheerio from 'cheerio';
import moment from 'moment';
import { doorAxios } from './util';
import { Attachment, FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Assignment } from './interfaces/assignment';
import { parseInformaticTableElement, parseSubmission, parseTableElement } from './util';

export async function getAssignment(courseId: ID, id: ID): Promise<Assignment> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`)).data);

	const descriptionTable = document(`#sub_content2 > div:nth-child(1) > table`).toArray().pop();
	const resultTable = document(`#sub_content2 > div:nth-child(3) > table:not(.tbl_type)`).toArray().pop();
	const submissionTable = document(`#sub_content2 > div.form_table_s > table`).toArray().pop();

	if(!descriptionTable || !submissionTable) throw new Error(`과제 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.`);

	const description = parseInformaticTableElement(descriptionTable);

	// 시간이 많이 지나면 평가 결과 table은 없어질 수도 있음
	const result = resultTable ? parseInformaticTableElement(resultTable) : undefined;
	const submission = parseSubmission(submissionTable);

	const attachments: Attachment[] = [];

	document('a', description['첨부파일'].element).toArray().forEach(file => {
		const fileElement = document(file);

		const attachment: Attachment = {
			title: fileElement.text().trim(),
			link: fileElement.attr('href') || ''
		};

		if(attachment.link) attachments.push(attachment);
	});

	const resultComment = result?.['코멘트'].text;
	const resultScore = Number(result?.['점수']?.text?.match(/\d+/)?.[0]) || undefined;

	const from = moment(description['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate();
	const to = moment(description['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate();

	const bonusPeriod = (description['추가 제출기간'].text.trim() === '없음') ? undefined : {
		from: moment(description['추가 제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate(),
		to: moment(description['추가 제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate()
	};

	return {
		id: id,
		courseId: courseId,

		type: description['과제유형'].text,
		title: description['제목'].text,
		contents: document(description['내용'].element).html() || undefined,

		createdAt: from,
		period: { from, to },
		bonusPeriod,

		attachments,
		submission,

		result: resultComment || resultScore ? {
			score: resultScore,
			comment: resultComment
		} : undefined,

		...fulfilledFetchable()
	};
}

export async function getAssignments(courseId: ID): Promise<FetchableMap<Assignment>> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseHomeworkStudentList/${courseId}`)).data);

	const table = document(`#sub_content2 > div > table`).toArray().pop();

	if(!table) throw new Error(`Cannot fetch Assignment List. Please check login status.`);

	const assignments = parseTableElement(table).map(assignment => {
		const from = moment(assignment['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate();
		const to = moment(assignment['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate();
		
		return {
			id: assignment['과제제목'].url?.match(/HomeworkNo=(\d+)/)?.[1],
			courseId: courseId,

			title: assignment['과제제목'].text,
			type: assignment['과제유형'].text,

			createdAt: from,
			period: { from, to },

			achieved: assignment['제출여부'].text === '제출',

			...notFulfilledFetchable()
		};
	});

	return {
		// Ascending order to descending order
		items: Object.fromEntries(assignments.map(assignment => [assignment.id, assignment]).reverse()),

		...fulfilledFetchable()
	};
}