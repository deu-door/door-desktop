import { IActivityPost, IActivityPostHead, IAttachment, ICourse, PostVariant } from 'models/door';
import moment from 'moment';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseInformaticTableElement, parseSubmission, parseTableElement } from '../util';

/**
 * @description 수업활동일지 게시물의 전체 정보를 받아옵니다.
 *
 * @param params 수업활동일지를 받아오는 데 필요한 필드입니다. 이전에 받아놓은 IActivityPost 또는 IActivityPostHead 를 넣어주세요.
 */
export async function getActivityPost(
	params: Pick<IActivityPost, 'courseId' | 'id'> & Partial<IActivityPost>,
): Promise<Response<IActivityPost>> {
	const { courseId, id } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`)).data);

	const descriptionTable = document.querySelector('#sub_content2 > div:nth-child(1) > table');
	const resultTable = document.querySelector('#sub_content2 > div:nth-child(3) > table:not(.tbl_type)');
	const submissionTable = document.querySelector('#sub_content2 > div.form_table_s > table');
	const form = document.querySelector('#CourseLeture');

	if (!(descriptionTable instanceof HTMLTableElement && submissionTable instanceof HTMLTableElement && form instanceof HTMLFormElement))
		throw new UnauthorizedError('수업활동일지 정보를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const description = parseInformaticTableElement(descriptionTable);

	const attachments: IAttachment[] = [];

	description['첨부파일'].element.querySelectorAll('a').forEach(fileElement => {
		const attachment: IAttachment = {
			title: fileElement.innerText.trim(),
			link: fileElement.getAttribute('href') || '',
		};

		if (attachment.link !== '') attachments.push(attachment);
	});

	// 시간이 많이 지나면 평가 결과 table은 없어질 수도 있음
	const result = resultTable instanceof HTMLTableElement ? parseInformaticTableElement(resultTable) : undefined;
	const comment = result?.['코멘트']?.text;

	const from = moment(description['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
	const to = moment(description['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

	const additionalDuration =
		(description['추가 제출기간']?.text.trim() || '없음') === '없음'
			? undefined
			: {
					from: moment(description['추가 제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString(),
					to: moment(description['추가 제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString(),
			  };

	// 제출 관련 정보 파싱
	const submission = parseSubmission(submissionTable);

	return {
		data: {
			variant: PostVariant.activity,

			id,
			courseId,

			type: params.type ?? '',

			title: description['주제'].text,
			contents: description['수업내용'].element.innerHTML ?? '',

			createdAt: from,
			duration: { from, to },
			additionalDuration,

			attachments,

			submitted: submission.contents.length > 0 || submission.attachments.length > 0,
			submission,

			evaluationResult: comment ? { comment } : undefined,

			partial: false,
		},
	};
}

/**
 * @description 수업활동일지 목록을 받아옵니다. 각 수업활동일지 항목들은 간단한 정보만 가지고 있습니다.
 *
 * @param params Course의 id 값이 필요합니다.
 *
 * @see {IActivityPostHead}
 */
export async function getActivityPosts(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<IActivityPostHead[]>> {
	const { id: courseId } = params;

	const document = parse((await driver.get(`/LMS/LectureRoom/CourseOutputs/${courseId}`)).data);

	const table = document.querySelector('#sub_content2 > div > table');

	if (!(table instanceof HTMLTableElement))
		throw new UnauthorizedError('수업활동일지 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const activityPosts: IActivityPostHead[] = parseTableElement(table)
		// filter for 등록된 산출물이 없습니다
		.filter(row => /\d+/.test(row['No'].text))
		.map(activity => {
			const from = moment(activity['제출기간'].text.split('~')[0].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();
			const to = moment(activity['제출기간'].text.split('~')[1].trim(), 'YY-MM-DD HH:mm').toDate().toISOString();

			return {
				variant: PostVariant.activity,

				id: activity['주제'].url?.match(/HomeworkNo=(\d+)/)?.[1] || '',
				courseId,

				title: activity['주제'].text,
				type: activity['제출방식'].text,

				createdAt: from,
				duration: { from, to },

				partial: true,
			};
		})
		.filter(activityPost => activityPost.id !== '');

	return {
		data: activityPosts,
	};
}
