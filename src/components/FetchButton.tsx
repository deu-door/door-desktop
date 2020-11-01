import { Button, CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Fetchable } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
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

export type FetchButtonProps = { fetchable: Fetchable, action?: FetchableAction };

export const FetchButton: React.FC<FetchButtonProps> = props => {
	const { fetchable, action } = props;
	const classes = useStyles();
	const dispatch = useDispatch();

	const handleClick = () => action && dispatch(action.fetch());

	return (
		<div className={classes.fetchableWrapper}>
			<Button size="small" color="primary" disabled={fetchable.pending} onClick={handleClick}>
				{fetchable.fulfilled ? <span>새로고침 · <DateTime date={fetchable.fetchedAt} relative /></span> : "불러오기"}
			</Button>
			{fetchable.pending && <CircularProgress size={20} className={classes.fetchableProgress} />}
		</div>
	)
}
