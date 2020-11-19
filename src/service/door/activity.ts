import cheerio from 'cheerio';
import moment from 'moment';
import { doorAxios } from './util';
import { Attachment, FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { Activity } from './interfaces/activity';
import { parseInformaticTableElement, parseSubmission, parseTableElement } from './util';

export async function getActivity(courseId: ID, id: ID): Promise<Activity> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`)).data);

	const descriptionTable = document(`#sub_content2 > div:nth-child(1) > table`).toArray().pop();
	const resultTable = document(`#sub_content2 > div:nth-child(3) > table:not(.tbl_type)`).toArray().pop();
	const submissionTable = document(`#sub_content2 > div.form_table_s > table`).toArray().pop();

	if(!descriptionTable || !submissionTable) throw new Error(`수업활동일지 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.`);

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

	const comment = result?.['코멘트'].text;

	const from = moment(description['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate();
	const to = moment(description['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate();

	const bonusPeriod = (description['추가 제출기간'].text.trim() === '없음') ? undefined : {
		from: moment(description['추가 제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate(),
		to: moment(description['추가 제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate()
	};

	return {
		id: id,
		courseId: courseId,
		
		title: description['주제'].text,
		contents: document(description['수업내용'].element).html() || undefined,

		createdAt: from,
		period: { from, to },
		bonusPeriod,

		attachments,
		submission,

		result: comment ? { comment } : undefined,

		...fulfilledFetchable()
	};
}

export async function getActivities(courseId: ID): Promise<FetchableMap<Activity>> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseOutputs/${courseId}`)).data);

	const table = document(`#sub_content2 > div > table`).toArray().pop();

	if(!table) throw new Error(`수업활동일지 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.`);

	const activities = parseTableElement(table).map(activity => {
		const from = moment(activity['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate();
		const to = moment(activity['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate();
		
		return {
			id: activity['주제'].url?.match(/HomeworkNo=(\d+)/)?.[1],
			courseId: courseId,

			title: activity['주제'].text,
			type: activity['제출방식'].text,

			createdAt: from,
			period: { from, to },

			...notFulfilledFetchable()
		};
	});

	return {
		// Ascending order to descending order
		items: Object.fromEntries(activities.map(activity => [activity.id, activity]).reverse()),

		...fulfilledFetchable()
	};
}