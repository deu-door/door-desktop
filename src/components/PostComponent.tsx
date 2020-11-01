import { Card, CardActions, CardContent, CardHeader, createStyles, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Post } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { FetchButton } from './FetchButton';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0)
	}
}));

export const PostComponent: React.FC<{ post: Post, action?: FetchableAction }> = props => {
	const { post, action } = props;
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
			{action && <CardActions>
				<FetchButton fetchable={post} action={action} />
			</CardActions>}
		</Card>
	);
};