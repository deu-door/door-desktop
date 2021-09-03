/**
 * Door Desktop 내부적으로, RequestMetadata를 구분하기 위해 URI 체계를 사용한다.
 *
 * URI의 고유 값은 자원 또는 액션에 대응된다. 예를 들어 유저 정보를 가져오는 URI는 /user 이다.
 *
 * 이는 곧 RequestMetadata의 id 값이 되며 URI 값을 통해 자원의 pending, fulfilledAt, error 등을 가져올 수 있다.
 *
 * 또, Assignment, Post, Lecture의 id 필드는 사실상 고유하지 않은 값이기 때문에 해당 인스턴스의 구분을 위해
 *
 * 별도 ID 값으로도 사용한다.
 */
import { Assignment, Course, Post, Term, Lecture, PostVariant, AssignmentVariant } from 'door-api';
import { BatchActionProgress } from '../batchAction/batchAction.interfaces';

export function userURI(): string {
	return '/user';
}

export function userLoginURI(): string {
	return '/user/login';
}

export function userLogoutURI(): string {
	return '/user/logout';
}

export function termListURI(): string {
	return '/term';
}

export function courseListURI(params: Pick<Term, 'id'>): string {
	return `/term/${params.id}/courses`;
}

export function courseURI(params: Pick<Course, 'id'>): string {
	return `/course/${params.id}`;
}

export function courseSyllabusURI(params: Pick<Course, 'id'>): string {
	return `/course/${params.id}/syllabus`;
}

export function postListURI(params: Pick<Course, 'id'> & { variant: PostVariant }): string {
	return `/course/${params.id}/posts/${params.variant}`;
}

export function postURI(params: Pick<Post, 'variant' | 'id'>): string {
	return `/post/${params.variant}/${params.id}`;
}

export function assignmentListURI(params: Pick<Course, 'id'> & { variant: AssignmentVariant }): string {
	return `/course/${params.id}/assignments/${params.variant}`;
}

export function assignmentURI(params: Pick<Assignment, 'variant' | 'id'>): string {
	return `/assignment/${params.variant}/${params.id}`;
}

export function lectureListURI(params: Pick<Course, 'id'>): string {
	return `/course/${params.id}/lectures`;
}

export function lectureProgressListURI(params: Pick<Course, 'id'>): string {
	return `/course/${params.id}/lectureProgresses`;
}

export function lectureURI(params: Pick<Lecture, 'courseId' | 'week' | 'period'>): string {
	return `/lecture/${params.courseId}/${params.week}/${params.period}`;
}

export function batchActionURI(params: Pick<BatchActionProgress, 'id'>): string {
	return `/batchAction/${params.id}`;
}
