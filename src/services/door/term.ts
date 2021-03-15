import { ITerm } from 'models/door';
import { Response, UnauthorizedError } from 'services/response';
import { driver, parse } from './util';

export async function getTerms(): Promise<Response<ITerm[]>> {
	const document = parse((await driver.get('/MyPage')).data);

	const termsSelect = document.querySelector('#tno');

	if (!(termsSelect instanceof HTMLSelectElement))
		throw new UnauthorizedError('학기 목록을 불러올 수 없습니다. 로그인 상태를 확인해주세요.');

	const terms = Array.from(termsSelect.querySelectorAll('option'))
		.map(optionElement => ({
			id: optionElement.getAttribute('value') || '',
			name: optionElement.innerText.trim(),
		}))
		.filter(term => term.id !== '')
		// currently not support for
		.filter(term => !(term.name.includes('동계학기') || term.name.includes('하계학기')));

	return {
		data: terms,
	};
}
