import { Fetchable, FetchableMap, Identifiable } from ".";
import { Assignment } from "./assignment";
import { Lecture } from "./lecture";
import { Notice } from "./notice";

/**
 * @description 강의에 대한 정보를 얻을 수 있습니다.
 */
export interface Course extends Identifiable, Fetchable {
	/**
	 * @description Resource ID
	 * 
	 * 홈페이지 URL을 통해 접근할 때 사용하는 자원 ID
	 * door.deu.ac.kr/LMS/LectureRoom/Main/{ID}
	 */
	readonly id: string,
	/**
	 * @description 교과목
	 * 
	 * @example ICT융합기술론
	 */
	name: string,
	/**
	 * @description 구분
	 * 
	 * @example 전공필수|전공선택
	 */
	type: string,
	/**
	 * @description 담당교수
	 * 
	 * @example 홍길동
	 */
	professor: string,
	/**
	 * @description 분반
	 * 
	 * @example 5
	 */
	division: string,

	// 아래부터는 자식 객체 관련 내용

	/**
	 * @description 강의 영상 목록. 주차 별 구분 없이 배열로 저장
	 */
	lectures: FetchableMap<FetchableMap<Lecture> & Identifiable>,
	/**
	 * @description 공지사항 목록
	 */
	notices: FetchableMap<Notice>,
	/**
	 * @description 과제 목록
	 */
	assignments: FetchableMap<Assignment>,

	// 아래부터는 수업계획서 내용임 (추가적인 fetch 필요)

	/**
	 * @description 주관학과
	 * 
	 * @example 컴퓨터공학과
	 */
	major?: string,
	/**
	 * @description 학점
	 * 
	 * @example 3.00
	 */
	credits?: number,
	/**
	 * @description 시간
	 * 
	 * @example 4
	 */
	hours?: number,
	/**
	 * @description 교수 연락처
	 * 
	 * @example 051-000-0000
	 */
	contact?: string,
	/**
	 * @description 교수 이메일
	 * 
	 * @example example@deu.ac.kr
	 */
	email?: string,
	/**
	 * @description 교과목 개요
	 * 
	 * @example 컴퓨터 프로그래밍이란 프로그램을 작성하는 것을 말한다. ...
	 */
	description?: string,
	/**
	 * @description 교과목 교육목표
	 * 
	 * @example 컴퓨터 프로그래밍의 정의를 이해하고, 프로그램 설계 과정의 기초에 대해 학습한다.
	 */
	goal?: string,
	/**
	 * @description 주교재
	 * 
	 * @example C언어 스케치
	 */
	book?: string
	/**
	 * @description 주차별 강의계획
	 */
	schedule?: {
		/**
		 * @description 주차 정보
		 * 
		 * @example 3 (3주차)
		 */
		[key: string]: {
			id: string,
			from: Date,
			to: Date,
			contents?: string,
			remark?: string
		}
	}
}
