import { ICourseRateInfo } from './rate-info';
import { ICourseWeekInfo } from './week-info';

/**
 * @description 수업 계획서 내용, 추가적인 fetch로 얻을 수 있음
 */
export interface ICourseSyllabus {
	/**
	 * @description 주관학과
	 *
	 * @example 컴퓨터공학과
	 */
	major: string;
	/**
	 * @description 대상학년
	 *
	 * @example 2 (2학년)
	 */
	target: number;
	/**
	 * @description 학점
	 *
	 * @example 3.00
	 */
	credits: number;
	/**
	 * @description 시간
	 *
	 * @example 4
	 */
	hours: number;
	/**
	 * @description 교수 연락처
	 *
	 * @example 051-000-0000
	 */
	contact: string;
	/**
	 * @description 교수 이메일
	 *
	 * @example example@deu.ac.kr
	 */
	email: string;
	/**
	 * @description 교과목 개요
	 *
	 * @example 컴퓨터 프로그래밍이란 프로그램을 작성하는 것을 말한다. ...
	 */
	description: string;
	/**
	 * @description 교과목 교육목표
	 *
	 * @example 컴퓨터 프로그래밍의 정의를 이해하고, 프로그램 설계 과정의 기초에 대해 학습한다.
	 */
	goal: string;
	/**
	 * @description 강의실 및 시간
	 *
	 * @example 정보810[월5-6], 정보810[수5]
	 */
	times: ICourseTime[];
	/**
	 * @description 주교재
	 *
	 * @example C언어 스케치
	 */
	book: string;
	/**
	 * @description 수업 평가 방법 (비율)
	 */
	rateInfo: ICourseRateInfo;
	/**
	 * @description 주차별 강의계획
	 */
	weeks: ICourseWeekInfo[];
}

/**
 * @description 강의실 및 시간
 *
 * @example 정보810[월5-6]
 */
export interface ICourseTime {
	/**
	 * @description 강의실
	 *
	 * @example 정보810
	 */
	room: string;
	/**
	 * @description 요일
	 *
	 * @example 월
	 */
	day: string;
	/**
	 * @description 시간
	 *
	 * @example [1, 2] (1교시, 2교시)
	 */
	times: number[];
}
