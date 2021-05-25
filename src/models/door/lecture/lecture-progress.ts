import { CourseSubordinated } from '../course/course';
import { WeekTagged } from '../week-tagged';

export interface ILectureProgress extends WeekTagged, CourseSubordinated {
	/**
	 * @description 수업의 형태. 온라인 또는 오프라인
	 */
	type: '온라인' | '오프라인';
	/**
	 * @description 최종 학습시간
	 */
	length: number;
	/**
	 * @description 진행중인 학습시간
	 */
	current: number;
	/**
	 * @description 강의 접속 수
	 */
	views: number;
	/**
	 * @description 최초 학습일
	 */
	startedAt?: string;
	/**
	 * @description 학습 완료일
	 */
	finishedAt?: string;
	/**
	 * @description 최근 학습일
	 */
	recentViewedAt?: string;
}
