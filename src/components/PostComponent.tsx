import { Card, CardActions, CardContent, CardHeader, createStyles, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Post } from 'service/door/interfaces';
import { FetchButton } from './FetchButton';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0)
	}
}));

export const PostComponent: React.FC<{ post: Post, onFetch?: () => void }> = props => {
	const { post, onFetch } = props;
	const classes = useStyles();

	return (
		<Card className={classes.post}>
			<CardHeader
				title={post.title}
				subheader={post.author}
			/>
			{post.contents && <CardContent>
				<Typography variant="body2" color="textSecondary" component="span" paragraph>
					<div dangerouslySetInnerHTML={{ __html: post.contents }}></div>
				</Typography>
			</CardContent>}
			{onFetch && <CardActions>
				<FetchButton fetchable={post} onFetch={onFetch} />
			</CardActions>}
		</Card>
	);
};