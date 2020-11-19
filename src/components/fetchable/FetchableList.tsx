import { createStyles, makeStyles } from '@material-ui/core';
import React from 'react';
import { Fetchable, FetchableMap } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import { FetchButton } from './FetchButton';

const useStyles = makeStyles(theme => createStyles({
	fetchButton: {
		margin: theme.spacing(2, 0)
	}
}));

export type FetchableListProps = { fetchableMap: FetchableMap<Fetchable>, action: FetchableAction };

export const FetchableList: React.FC<FetchableListProps> = props => {
	const { children, fetchableMap, action } = props;
	const classes = useStyles();

	return (
		<div>
			<FetchButton
				className={classes.fetchButton}
				fetchable={fetchableMap}
				action={action}
			/>
			{children}
		</div>
	);
}