import { Button, Card, CardActions, CardContent, CardHeader, createStyles, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Fetchable, Post } from 'service/door/interfaces';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0)
	}
}));

export const FetchableControl: React.FC<{ fetchable: Fetchable, fetcher?: Function }> = props => {
	const { fetchable, fetcher } = props;
	const dispatch = useDispatch();

	return (
		<Button size="small" color="primary" disabled={fetchable.pending} onClick={() => fetcher && dispatch(fetcher())}>
			{fetchable.fulfilled ? "새로고침" : "불러오기"}
		</Button>
	)
}

export const PostComponent: React.FC<{ post: Post, fetcher?: Function }> = props => {
	const { post, fetcher } = props;
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
			{fetcher && <CardActions>
				<FetchableControl fetchable={post} fetcher={fetcher} />
			</CardActions>}
		</Card>
	);
};