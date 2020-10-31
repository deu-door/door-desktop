import { Button, CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { Fetchable } from 'service/door/interfaces';
import { DateTime } from './DateTime';

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

export type FetchButtonProps = { fetchable: Fetchable, onFetch?: () => void };

export const FetchButton: React.FC<FetchButtonProps> = props => {
	const { fetchable, onFetch } = props;
	const classes = useStyles();

	return (
		<div className={classes.fetchableWrapper}>
			<Button size="small" color="primary" disabled={fetchable.pending} onClick={() => onFetch?.()}>
				{fetchable.fulfilled ? <span>새로고침 · <DateTime date={fetchable.fetchedAt} relative /></span> : "불러오기"}
			</Button>
			{fetchable.pending && <CircularProgress size={20} className={classes.fetchableProgress} />}
		</div>
	)
}
