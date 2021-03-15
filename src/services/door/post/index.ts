import { CourseSubordinated, ICourse, IPost, IPostHead, PostVariant } from 'models/door';
import { Response } from 'services/response';
import { getActivityPost, getActivityPosts } from './activity-post';
import { getAssignmentPost, getAssignmentPosts } from './assignment-post';
import { getDoorPost, getDoorPosts } from './door-post';
import { getNoticePost, getNoticePosts } from './notice-post';
import { getReferencePost, getReferencePosts } from './reference-post';
import { getTeamProjectPost, getTeamProjectPosts } from './team-project-post';

/**
 * @description 여러 종류의 게시물을 하나의 함수로 normalize한 함수
 *
 * @param params 게시물 목록을 가져올 때 필요한 공통 인자.
 */
export const getPosts = (params: Pick<ICourse, 'id'> & { variant: PostVariant }): Promise<Response<IPostHead[]>> => {
	const { variant } = params;

	return {
		[PostVariant.activity]: () => getActivityPosts(params),
		[PostVariant.assignment]: () => getAssignmentPosts(params),
		[PostVariant.door]: () => getDoorPosts(params),
		[PostVariant.notice]: () => getNoticePosts(params),
		[PostVariant.reference]: () => getReferencePosts(params),
		[PostVariant.teamProject]: () => getTeamProjectPosts(params),
	}[variant]();
};

/**
 * @description 여러 종류의 게시물을 하나의 함수로 normalize한 함수
 *
 * @param params 게시물 세부 사항을 가져올 때 필요한 공통 인자
 */
export const getPost = (params: Pick<IPost, 'id'> & CourseSubordinated & { variant: PostVariant }): Promise<Response<IPost>> => {
	const { variant } = params;

	return {
		[PostVariant.activity]: () => getActivityPost(params),
		[PostVariant.assignment]: () => getAssignmentPost(params),
		[PostVariant.door]: () => getDoorPost(params),
		[PostVariant.notice]: () => getNoticePost(params),
		[PostVariant.reference]: () => getReferencePost(params),
		[PostVariant.teamProject]: () => getTeamProjectPost(params),
	}[variant]();
};
