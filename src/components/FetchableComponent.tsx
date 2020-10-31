import { Button, CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { Fetchable } from 'service/door/interfaces';

const useStyles = makeStyles(theme => createStyles({
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

export const FetchableComponent: React.FC<{ fetchable: Fetchable, onFetch?: () => void }> = props => {
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