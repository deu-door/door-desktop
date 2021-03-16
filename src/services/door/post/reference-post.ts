import { IAttachment, ICourse, IReferencePost, IReferencePostHead, PostVariant } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, parseInformaticTableElement, parseTableElement } from '../util';

export async function getReferencePost(
	params: Pick<IReferencePost, 'courseId' | 'id'> & Partial<IReferencePost>,
): Promise<Response<IReferencePost>> {
	const { courseId, id } = params;

	// /BBS/Board/Read 로 요청을 보내면 서버 자체적으로 "읽음" 처리된 후 /BBS/Board/Detail로 리다이렉트됨
	const document = parse((await driver.get(`/BBS/Board/Read/CourseReference/${id}`)).data);

	const detailTable = document.querySelector('#boardForm > div.form_table > table');

	if (!(detailTable instanceof HTMLTableElement))
		throw new UnauthorizedError('강의자료를 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const detail = parseInformaticTableElement(detailTable);

	const attachments: IAttachment[] = [];

	detail['첨부파일'].element.querySelectorAll('a').forEach(fileElement => {
		const attachment: IAttachment = {
			title: fileElement.innerText.trim(),
			link: fileElement.getAttribute('href') || '',
		};

		if (attachment.link !== '') attachments.push(attachment);
	});

	return {
		data: {
			variant: PostVariant.reference,

			id,
			courseId,

			title: detail['제목'].text,
			author: detail['작성자'].text,
			createdAt: new Date(detail['등록일'].text).toISOString(),
			views: Number(detail['조회'].text),
			contents: detail['내용'].element.innerHTML || '',
			noted: true,

			attachments: attachments,

			partial: false,
		},
	};
}

export async function getReferencePosts(params: Pick<ICourse, 'id'> & Partial<ICourse>): Promise<Response<IReferencePostHead[]>> {
	const { id: courseId } = params;

	const document = parse((await driver.get(`/BBS/Board/List/CourseReference?cNo=${courseId}&pageRowSize=200`)).data);

	const table = document.querySelector('#sub_content2 > div.form_table > table');

	if (!(table instanceof HTMLTableElement))
		throw new UnauthorizedError('강의자료 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const referencePosts = parseTableElement(table)
		.map(row => ({
			variant: PostVariant.reference,

			id: row['제목'].url?.match(/CourseReference\/(\d+)/)?.[1] || '',
			courseId: courseId,

			author: row['작성자'].text,
			createdAt: new Date(row['등록일'].text).toISOString(),
			title: row['제목'].text,
			views: Number(row['조회'].text),
			noted: row['읽음'].element.querySelector('img[alt=확인]') instanceof HTMLImageElement,

			partial: true,
		}))
		.filter(referencePost => referencePost.id !== '');

	return {
		data: referencePosts,
	};
}
