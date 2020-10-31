import { Button, Card, CardActions, CardContent, CardHeader, CircularProgress, createStyles, makeStyles, Typography } from '@material-ui/core';
import React from 'react';
import { Fetchable, Post } from 'service/door/interfaces';

const useStyles = makeStyles(theme => createStyles({
	post: {
		margin: theme.spacing(2, 0)
	},
	fetchableWrapper: {
		position: 'relative'
	},
	fetchableProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -10,
		marginLeft: -10
	}
}));

export const FetchableControl: React.FC<{ fetchable: Fetchable, onFetch?: () => void }> = props => {
	const { fetchable, onFetch } = props;
	const classes = useStyles();

	return (
		<div className={classes.fetchableWrapper}>
			<Button size="small" color="primary" disabled={fetchable.pending} onClick={() => onFetch?.()}>
				{fetchable.fulfilled ? "새로고침" : "불러오기"}
			</Button>
			{fetchable.pending && <CircularProgress size={20} className={classes.fetchableProgress} />}
		</div>
	)
}

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
				<FetchableControl fetchable={post} onFetch={onFetch} />
			</CardActions>}
		</Card>
	);
};