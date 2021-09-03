import { Lecture } from 'door-api';

export function getLectureStateColor(state: Lecture['type'] | Lecture['attendance']): string {
	return state === '대면'
		? '#812BFE'
		: state === '시험'
		? '#357C64'
		: state === '강의'
		? '#F559AE'
		: state === '출석'
		? '#57B6EC'
		: state === '완료전'
		? '#B8B7B7'
		: state === '미수강'
		? '#B464EE'
		: state === '결석'
		? '#FA6556'
		: state === '지각'
		? '#FA9C2F'
		: '#B7B7B7';
}
