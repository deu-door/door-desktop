import { IAssignmentPost, IAssignmentPostHead, IAttachment, ICourse, PostVariant } from 'models/door';
import moment from 'moment';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseInformaticTableElement, parseSubmission, parseTableElement } from '../util';

export async function getAssignmentPost(
	params: Pick<IAssignmentPost, 'courseId' | 'id'> & Partial<IAssignmentPost>,
): Promise<Response<IAssignmentPost>> {
	const { courseId, id } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`)).data);

	const descriptionTable = document.querySelector('#sub_content2 > div:nth-child(1) > table');
	const resultTable = document.querySelector('#sub_content2 > div:nth-child(3) > table:not(.tbl_type)'); // this may be a null
	const submissionTable = document.querySelector('#sub_content2 > div.form_table_s > table');
	const form = document.querySelector('#CourseLeture');

	if (!(descriptionTable instanceof HTMLTableElement && submissionTable instanceof HTMLTableElement && form instanceof HTMLFormElement))
		throw new UnauthorizedError('과제 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const description = parseInformaticTableElement(descriptionTable);

	// 시간이 많이 지나면 평가 결과 table은 없어질 수도 있음
	const result = resultTable instanceof HTMLTableElement ? parseInformaticTableElement(resultTable) : undefined;

	const attachments: IAttachment[] = [];

	description['첨부파일'].element.querySelectorAll('a').forEach(fileElement => {
		const attachment: IAttachment = {
			title: fileElement.innerText.trim(),
			link: fileElement.getAttribute('href') || '',
		};

		if (attachment.link !== '') attachments.push(attachment);
	});

	const resultComment = result?.['코멘트'].text;
	const resultScore = Number(result?.['점수']?.text?.match(/\d+/)?.[0]) || undefined;

	const from = moment(description['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
	const to = moment(description['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

	const additionalDuration =
		description['추가 제출기간'].text.trim() === '없음'
			? undefined
			: {
					from: moment(description['추가 제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString(),
					to: moment(description['추가 제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString(),
			  };

	// 제출 관련 정보 파싱
	const submission = parseSubmission(submissionTable);

	return {
		data: {
			variant: PostVariant.assignment,

			id,
			courseId,

			type: description['과제유형'].text,
			title: description['제목'].text,
			contents: description['내용'].element.innerHTML ?? '',

			createdAt: from,
			duration: { from, to },
			additionalDuration,

			attachments,

			submitted: submission.contents.length > 0 || submission.attachments.length > 0,
			submission,

			evaluationResult:
				resultComment || resultScore
					? {
							score: resultScore,
							comment: resultComment,
					  }
					: undefined,

			partial: false,
		},
	};
}

export async function getAssignmentPosts(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<IAssignmentPostHead[]>> {
	const { id: courseId } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseHomeworkStudentList/${courseId}`)).data);

	const table = document.querySelector('#sub_content2 > div > table');

	if (!(table instanceof HTMLTableElement)) throw new UnauthorizedError('과제 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const assignmentPosts: IAssignmentPostHead[] = parseTableElement(table)
		// filter for 등록된 과제가 없습니다
		.filter(row => /\d+-\d+/.test(row['주차-차시'].text))
		.map(row => {
			const from = moment(row['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
			const to = moment(row['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

			return {
				variant: PostVariant.assignment,

				id: row['과제제목'].url?.match(/HomeworkNo=(\d+)/)?.[1] || '',
				courseId: courseId,

				title: row['과제제목'].text,
				type: row['과제유형'].text,

				createdAt: from,
				duration: { from, to },

				submitted: row['제출여부'].text === '제출',

				partial: true,
			};
		})
		.filter(assignmentPost => assignmentPost.id !== '');

	return {
		// Ascending order to descending order
		data: assignmentPosts,
	};
}
