import { CourseSubordinated } from '../course/course';
import { Due } from '../due';
import { IAttachment } from '../post/attachment';
import { WeekTagged } from '../week-tagged';
import { ILectureProgress } from './lecture-progress';

export interface ILecture extends Partial<IAttachment>, WeekTagged, Due, CourseSubordinated {
	/**
	 * @description 강의 주제
	 *
	 * @example 데이터활용프로그래밍 수업 안내
	 */
	title: string;
	/**
	 * @description 형태 (강의/대면)
	 *
	 * @example 강의
	 */
	type: '강의' | '대면' | '시험' | '휴강' | string;
	/**
	 * @description 학습시간(분)
	 *
	 * @example 24
	 */
	length: number;
	/**
	 * @description 출결 상태 (미수강/완료전/출석)
	 *
	 * @example 완료전
	 */
	attendance: string;
	/**
	 * @description 강의 학습현황
	 */
	progress?: ILectureProgress;
}
