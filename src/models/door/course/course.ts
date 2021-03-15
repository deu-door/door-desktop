import { Identifiable, ResourceID } from '../identifiable';
import { TermSubordinated } from '../term';
import { ICourseSyllabus } from './syllabus';

/**
 * @description 강의에 대한 정보를 얻을 수 있습니다.
 */
export interface ICourse extends Identifiable, TermSubordinated {
	/**
	 * @description Resource ID
	 *
	 * 홈페이지 URL을 통해 접근할 때 사용하는 자원 ID
	 * door.deu.ac.kr/LMS/LectureRoom/Main/{ID}
	 */
	readonly id: ResourceID;
	/**
	 * @description 교과목
	 *
	 * @example ICT융합기술론
	 */
	name: string;
	/**
	 * @description 구분
	 *
	 * @example 전공필수|전공선택
	 */
	type: string;
	/**
	 * @description 담당교수
	 *
	 * @example 홍길동
	 */
	professor: string;
	/**
	 * @description 분반
	 *
	 * @example 5
	 */
	division: string;
	/**
	 * @description 수업 계획서
	 */
	syllabus?: ICourseSyllabus;
}

/**
 * @description Course 인터페이스에 종속되어 있는 인터페이스
 */
export interface CourseSubordinated {
	/**
	 * @description Course의 id
	 */
	readonly courseId: ResourceID;
}
