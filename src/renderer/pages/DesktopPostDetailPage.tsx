import { RouteComponentProps } from 'react-router';
import React from 'react';
import { Post, PostVariant } from 'door-api';
import { usePost } from '../hooks/door/usePost';
import { DesktopNotFoundPage } from './DesktopNotFoundPage';
import { postURI } from '../../common/uri/uri';
import { DesktopPreviousButton } from '../components/common/DesktopPreviousButton';
import { DesktopSpacer } from '../components/common/DesktopSpacer';
import { Divider } from '@material-ui/core';
import { DesktopRequestButton } from '../components/common/DesktopRequestButton';
import { DesktopAttachmentList } from '../components/common/DesktopAttachment';
import { DesktopHtml } from '../components/common/DesktopHtml';
import { DesktopRequestTrigger } from '../components/common/DesktopRequestTrigger';
import { DesktopContentTitle } from '../components/content/DesktopContentTitle';
import { DesktopContentSubtitle } from '../components/content/DesktopContentSubtitle';

export type DesktopPostDetailPageProps = RouteComponentProps<{
	variant: PostVariant;
	postId: Post['id'];
}>;

export const DesktopPostDetailPage: React.FC<DesktopPostDetailPageProps> = props => {
	const {
		match: {
			params: { postId: id, variant },
		},
	} = props;

	const { postByURI, fetchNoticePost, fetchReferencePost } = usePost();
	const post = postByURI(postURI({ id, variant }));

	if (post === undefined)
		return <DesktopNotFoundPage>{`${postURI({ id, variant })} 에 해당되는 게시물이 없습니다.`}</DesktopNotFoundPage>;

	const fetch = () => {
		switch (post.variant) {
			case PostVariant.NOTICE:
				return fetchNoticePost(post);
			case PostVariant.REFERENCE:
				return fetchReferencePost(post);
		}
	};

	return (
		<>
			<DesktopRequestTrigger uri={postURI(post)} onRequest={fetch} />

			<DesktopPreviousButton />

			<DesktopSpacer vertical={3} />
			<DesktopContentTitle content={post} />
			<DesktopSpacer vertical={0.5} />
			<DesktopContentSubtitle content={post} course />

			<DesktopSpacer vertical={1} />
			<DesktopRequestButton uri={postURI(post)} onClick={fetch} />
			<DesktopSpacer vertical={1} />
			<Divider />
			<DesktopSpacer vertical={1} />

			{post.partial === false && (
				<>
					<DesktopAttachmentList attachments={post.attachments} />
					<DesktopSpacer vertical={1} />
					<DesktopHtml content={post.contents} />
				</>
			)}
		</>
	);
};
