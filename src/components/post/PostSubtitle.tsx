import { styled, Typography, TypographyProps } from '@material-ui/core';
import { DateTime } from 'components/common/DateTime';
import { Authored, IPost, IPostHead } from 'models/door';
import React, { useState } from 'react';

const isAuthored = (post: IPostHead): post is IPostHead & Authored => {
	return 'author' in post;
};

const PostSubtitleTypography = styled((props: TypographyProps) => (
	<Typography component="span" variant="subtitle2" color="textSecondary" {...props} />
))({
	'& span:not(:first-child)::before': {
		content: `" · "`,
		fontWeight: 'bolder',
	},
});

export type PostSubtitleProps = {
	post: IPostHead | IPost;
};

export const PostSubtitle: React.FC<PostSubtitleProps> = props => {
	const { post, children } = props;
	const [hover, setHover] = useState(false);

	return (
		<PostSubtitleTypography>
			{[
				isAuthored(post) ? post.author : undefined,
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
