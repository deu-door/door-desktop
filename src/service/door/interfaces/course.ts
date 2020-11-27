import { Fetchable, FetchableMap, Identifiable } from ".";
import { Activity } from "./activity";
import { Assignment } from "./assignment";
import { LearningStatus } from "./learning-status";
import { LecturesByWeek } from "./lecture";
import { Notice } from "./notice";
import { Reference } from "./reference";
import { TeamProject } from "./team-project";

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
	 * @description 공지사항 목록
	 */
	notices: FetchableMap<Notice>,
	/**
	 * @description 강의 영상 목록. 주차 별 구분 없이 배열로 저장
	 */
	lectures: FetchableMap<LecturesByWeek>,
	/**
	 * @description 과제 목록
	 */
	assignments: FetchableMap<Assignment>,
	/**
	 * @description 강의자료 목록
	 */
	references: FetchableMap<Reference>,
	/**
	 * @description 수업활동일지 목록
	 */
	activities: FetchableMap<Activity>,
	/**
	 * @description 팀 프로젝트 목록
	 */
	teamProjects: FetchableMap<TeamProject>,

	// 아래부터는 수업계획서 내용임 (추가적인 fetch 필요)

	/**
	 * @description 주관학과
	 * 
	 * @example 컴퓨터공학과
	 */
	major?: string,
	/**
	 * @description 대상학년
	 * 
	 * @example 2학년
	 */
	target?: string,
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
	 * @description 수업 평가 방법 (비율)
	 */
	rates?: {
		/**
		 * @description 중간고사
		 */
		midterm: number,
		/**
		 * @description 기말고사
		 */
		finalterm: number,
		/**
		 * @description 퀴즈
		 */
		quiz: number,
		/**
		 * @description 과제
		 */
		assignment: number,
		/**
		 * @description 팀PJ
		 */
		teamProject: number,
		/**
		 * @description 출석
		 */
		attendance: number,
		/**
		 * @description 기타1
		 */
		etc1: number,
		/**
		 * @description 기타2
		 */
		etc2: number,
		/**
		 * @description 기타3
		 */
		etc3: number,
		/**
		 * @description 발표
		 */
		presentation: number,
		/**
		 * @description 참여도
		 */
		participation: number
	},
	/**
	 * @description 주차별 강의계획
	 */
	schedule?: {
		/**
		 * @description 키: 주차 정보
		 * 
		 * @example 3 (3주차)
		 */
		[key: string]: CourseWeek
	},
	/**
	 * @description 학습 현황
	 */
	learningStatus: LearningStatus
}

export interface CourseWeek {
	/**
	 * @description 주차
	 * 
	 * @example 3
	 */
	week: string,
	/**
	 * @description 주차에 해당되는 날짜 (부터~)
	 * 
	 * @example 2020-11-03
	 */
	from: Date,
	/**
	 * @description 주차에 해당되는 날짜 (~까지)
	 */
	to: Date,
	/**
	 * @description 강의내용
	 * 
	 * @example 9장 변수 유효범위와 함수 활용(1)
	 */
	contents?: string,
	/**
	 * @description 과제/비고
	 * 
	 * @example 프로그램 수시 평가 / 1차 과제 제출
	 */
	remark?: string
}

export const initializeCourse = () => ({
	notices: { items: {}, fulfilled: false },
	lectures: { items: {}, fulfilled: false },
	assignments: { items: {}, fulfilled: false },
	references: { items: {}, fulfilled: false },
	activities: { items: {}, fulfilled: false },
	teamProjects: { items: {}, fulfilled: false },
	learningStatus: { list: [], fulfilled: false }
});