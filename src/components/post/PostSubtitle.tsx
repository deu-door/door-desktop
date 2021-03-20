import { styled, Typography, TypographyProps } from '@material-ui/core';
import { DateTime } from 'components/common/DateTime';
import { useCourses } from 'hooks/door/useCourses';
import { Authored, IPost, IPostHead, PostVariantNames } from 'models/door';
import React, { useState } from 'react';

const isAuthored = (post: IPostHead): post is IPostHead & Authored => {
	return 'author' in post;
};

const PostSubtitleTypography = styled(Typography)({
	'& span:not(:first-child)::before': {
		content: `" · "`,
		fontWeight: 'bolder',
	},
});

export type PostSubtitleProps = TypographyProps & {
	post: IPostHead | IPost;
	showCourse?: boolean;
	showVariant?: boolean;
	showAuthor?: boolean;
};

export const PostSubtitle: React.FC<PostSubtitleProps> = props => {
	const { post, children, showCourse, showVariant, showAuthor = true, ...otherProps } = props;
	const [hover, setHover] = useState(false);
	const { courseById } = useCourses();

	return (
		<PostSubtitleTypography variant="subtitle2" color="textSecondary" {...otherProps}>
			{[
				showCourse || showVariant ? (
					<strong>
						{`${showCourse ? courseById(post.courseId)?.name : ''} ${showVariant ? PostVariantNames[post.variant] : ''}`.trim()}
					</strong>
				) : undefined,
				showAuthor && isAuthored(post) ? post.author : undefined,
				post.views !== undefined ? `조회수 ${post.views}회` : undefined,
				<span key={0} onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
					<DateTime date={post.createdAt} {...(hover ? { format: 'YYYY년 M월 D일 A h시 m분' } : { fromNow: true })} />
				</span>,
			]
				.filter(field => field !== undefined)
				.map((field, i) => (
					<span key={i}>{field}</span>
				))}

			{children && (
				<>
					{' · '}
					{children}
				</>
			)}
		</PostSubtitleTypography>
	);
};
