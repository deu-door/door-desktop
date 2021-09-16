import { postListURI } from '../../common/uri/uri';
import { Course, PostVariant, PostVariantNames } from 'door-api';
import { RouteComponentProps } from 'react-router';
import { DesktopRequestButton } from '../components/common/DesktopRequestButton';
import { DesktopSpacer } from '../components/common/DesktopSpacer';
import { usePost } from '../hooks/door/usePost';
import React from 'react';
import { DesktopRequestTrigger } from '../components/common/DesktopRequestTrigger';
import { DesktopContentList } from '../components/content/DesktopContentList';

export type DesktopPostListPageProps = RouteComponentProps<{
	courseId: Course['id'];
	variant: PostVariant;
}>;

export const DesktopPostListPage: React.FC<DesktopPostListPageProps> = props => {
	const {
		match: {
			params: { courseId, variant },
		},
	} = props;

	const { fetchNoticePostList, fetchReferencePostList, postListByCourseAndVariant } = usePost();
	const postList = postListByCourseAndVariant(courseId, variant);

	const fetch = () => {
		switch (variant) {
			case PostVariant.NOTICE:
				return fetchNoticePostList(courseId);
			case PostVariant.REFERENCE:
				return fetchReferencePostList(courseId);
		}
	};

	return (
		<>
			<DesktopRequestTrigger uri={postListURI({ id: courseId, variant })} onRequest={fetch} />
			<DesktopRequestButton uri={postListURI({ id: courseId, variant })} onClick={fetch} />
			<DesktopSpacer vertical={0.7} />
			<DesktopContentList title={PostVariantNames[variant]} list={postList} groupByCreatedAt />
		</>
	);
};
