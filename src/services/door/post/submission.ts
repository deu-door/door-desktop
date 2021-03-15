import { AxiosRequestConfig } from 'axios';
import { ISubmittablePost, PostVariant } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse, uploader } from '../util';

export async function putSubmission(
	params: Pick<ISubmittablePost, 'variant' | 'id' | 'courseId'> & {
		form: {
			contents?: string;
			file?: File;
		};
	},
): Promise<Response<void>> {
	const {
		variant,
		courseId,
		id,
		form: { contents, file },
	} = params;

	const url =
		variant === PostVariant.teamProject
			? `/LMS/LectureRoom/CourseTeamProjectStudentDetail?CourseNo=${courseId}&ProjectNo=${id}`
			: `/LMS/LectureRoom/CourseHomeworkStudentDetail?CourseNo=${courseId}&HomeworkNo=${id}`;

	const document = parse((await driver.get(url)).data);

	const form = document.getElementById('CourseLeture');

	if (!(form instanceof HTMLFormElement)) throw new UnauthorizedError('제출을 진행할 수 없습니다. 로그인 상태를 확인해주세요.');

	const fields: Partial<{
		FileGroupNo: string;
		TFFile: null;
		id: string;
		'coursehomeworksubmits.CourseNo': string;
		'coursehomeworksubmits.FileGroupNo': string;
		'coursehomeworksubmits.SubmitNo': string;
		'coursehomeworksubmits.HomeworkNo': string;
		'coursehomeworksubmits.StrUserNo': string;
		'coursehomeworksubmits.IsOutput': string;
	}> = Object.fromEntries(
		Array.from(form.querySelectorAll<HTMLInputElement>('input[name]')).map(element => [element.name, element.value]),
	);

	const contentsInput = form.querySelector('textarea');
	const fileInput = form.querySelector('input[type=file]');

	const formData = new FormData();
	// Add default fields
	Object.entries(fields)
		// value must be truthy value
		.forEach(([key, value]) => value && formData.append(key, value));

	// Add contents
	if (contents !== undefined && contentsInput instanceof HTMLTextAreaElement) formData.append(contentsInput.name, contents);
	// Add file
	if (file !== undefined && fileInput instanceof HTMLInputElement) formData.append(fileInput.name, file);

	// redirects to listview
	await uploader({
		method: (form.getAttribute('method') as AxiosRequestConfig['method']) ?? 'POST',
		url: form.getAttribute('action') ?? url,
		data: formData,
	});

	return { data: void 0 };
}
