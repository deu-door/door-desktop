import cheerio from 'cheerio';
import moment from 'moment';
import { Attachment, FetchableMap, fulfilledFetchable, ID, notFulfilledFetchable } from './interfaces';
import { TeamProject } from './interfaces/team-project';
import { doorAxios, parseInformaticTableElement, parseSubmission, parseTableElement } from './util';

export async function getTeamProject(courseId: ID, id: ID): Promise<TeamProject> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo=${courseId}&ProjectNo=${id}`)).data);

	const descriptionTable = document(`#sub_content2 > div:nth-child(1) > table`).toArray().pop();
	const submissionTable = document(`#sub_content2 > div.form_table_s > table`).toArray().pop();

	if(!descriptionTable || !submissionTable) throw new Error(`팀 프로젝트 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.`);

	const description = parseInformaticTableElement(descriptionTable);

	// 시간이 많이 지나면 평가 결과 table은 없어질 수도 있음
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

	const from = moment(description['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate();
	const to = moment(description['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate();

	const bonusPeriod = (description['추가 제출기간'].text.trim() === '없음') ? undefined : {
		from: moment(description['추가 제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate(),
		to: moment(description['추가 제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate()
	};

	return {
		id: id,
		courseId: courseId,

		type: description['제출방식'].text,
		title: description['제목'].text,
		contents: document(description['내용'].element).html() || undefined,

		createdAt: from,
		period: { from, to },
		bonusPeriod,

		attachments,
		submission,

		...fulfilledFetchable()
	};
}

export async function getTeamProjects(courseId: ID): Promise<FetchableMap<TeamProject>> {
	const document = cheerio.load((await doorAxios.get(`/LMS/LectureRoom/CourseTeamProjectStudentList/${courseId}`)).data);

	const table = document(`#sub_content2 > div:nth-child(4) > table`).toArray().pop();

	if(!table) throw new Error(`팀 프로젝트 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.`);

	const teamProjects = parseTableElement(table).map(teamProject => {
		const from = moment(teamProject['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate();
		const to = moment(teamProject['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate();
		
		return {
			id: teamProject['팀프로젝트 제목'].url?.match(/ProjectNo=(\d+)/)?.[1],
			courseId: courseId,

			title: teamProject['팀프로젝트 제목'].text,
			type: teamProject['제출방식'].text,

			createdAt: from,
			period: { from, to },

			achieved: teamProject['제출 여부'].text === '제출',

			...notFulfilledFetchable()
		};
	});

	return {
		// Ascending order to descending order
		items: Object.fromEntries(teamProjects.map(teamProject => [teamProject.id, teamProject]).reverse()),

		...fulfilledFetchable()
	};
}