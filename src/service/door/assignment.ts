import cheerio from 'cheerio';
import { doorAxios, parseInfomaticTableElement, parseTableElement } from '.';
import { Attachment, FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Assignment } from './interfaces/assignment';

export async function getAssignment(courseId: ID, id: ID): Promise<Assignment> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`)).data);

	const descriptionTable = document(`#sub_content2 > div:nth-child(1) > table`).toArray().pop();
	const resultTable = document(`#sub_content2 > div:nth-child(3) > table:not(.tbl_type)`).toArray().pop();
	const submittedTable = document(`#sub_content2 > div.form_table_s > table`).toArray().pop();

	if(!descriptionTable || !submittedTable) throw new Error(`과제 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.`);

	const description = parseInfomaticTableElement(descriptionTable);

	// 시간이 많이 지나면 평가 결과 table은 없어질 수도 있음
	const result = resultTable ? parseInfomaticTableElement(resultTable) : undefined;
	const submitted = parseInfomaticTableElement(submittedTable);

	const attachments: Attachment[] = [];

	cheerio.load(description['첨부파일'].element)('a').toArray().forEach(file => {
		const fileElement = document(file);

		const attachment: Attachment = {
			title: fileElement.text().trim(),
			link: fileElement.attr('href') || ''
		};

		if(attachment.link) attachments.push(attachment);
	});

	const submittedAttachments: Attachment[] = [];
	
	cheerio.load(submitted['첨부파일'].element)('.filelist .fileitembox a[title=다운로드]').toArray().forEach(file => {
		const fileElement = document(file);

		const attachment: Attachment = {
			title: fileElement.text().trim(),
			link: fileElement.attr('href') || ''
		};

		if(attachment.link) submittedAttachments.push(attachment);
	});

	const resultComment = result?.['코멘트'].text;
	const resultScore = Number(result?.['점수']?.text?.match(/\d+/)?.[0]) || undefined;

	return {
		id: id,
		courseId: courseId,

		type: description['과제유형'].text,
		title: description['제목'].text,
		contents: document(description['내용'].element).html() || undefined,

		createdAt: new Date('20' + description['제출기간'].text.split('~')[0].trim()),
		period: {
			from: new Date('20' + description['제출기간'].text.split('~')[0].trim()),
			to: new Date('20' + description['제출기간'].text.split('~')[1].trim())
		},

		attachments: attachments,

		submittedContents: submitted['제출 내용'].text,
		submittedAttachments: submittedAttachments,

		result: resultComment || resultScore ? {
			score: resultScore,
			comment: resultComment
		} : undefined,

		achieved: attachments.length > 0,

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
		courseId: courseId,

		title: assignment['과제제목'].text,
		type: assignment['과제유형'].text,

		createdAt: new Date('20' + assignment['제출기간'].text.split('~')[0].trim()),
		period: {
			// TODO: Date Format이 변경되어도 유연한 처리가 될 수 있도록
			// Boilerplate가 필요
			from: new Date('20' + assignment['제출기간'].text.split('~')[0].trim()),
			to: new Date('20' + assignment['제출기간'].text.split('~')[1].trim())
		},
		achieved: assignment['제출여부'].text === '제출',

		...notFulfilledFetchable()
	} as Assignment));

	return {
		// Ascending order to descending order
		items: Object.fromEntries(assignments.map(assignment => [assignment.id, assignment]).reverse()),

		...fulfilledFetchable()
	};
}