import { Button, CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import { ErrorOutline, Refresh } from '@material-ui/icons';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Fetchable } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import clsx from 'clsx';
import VisibilitySensor from 'react-visibility-sensor';
import { DateTime } from 'components/core/DateTime';

const useStyles = makeStyles(theme => createStyles({
	fetchableButton: {
		color: theme.palette.primary.main
	},
	fetchableError: {
		color: theme.palette.error.main
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

export const FetchButton: React.FC<FetchButtonProps & React.HTMLAttributes<HTMLDivElement>> = props => {
	const { className, fetchable, action } = props;
	const classes = useStyles();
	const dispatch = useDispatch();

	const handleClick = () => action && dispatch(action.fetch());

	const onVisibilityChange = (isVisible: boolean) => {
		if(action && isVisible && !fetchable.pending) {
			if(!fetchable.fulfilled) {
				dispatch(action.fetchIfNotFulfilled());
			}else {
				dispatch(action.fetchIfExpired());
			}
		}
	};

	return (
		<div className={clsx(fetchable.error
						? classes.fetchableError
						: classes.fetchableButton, className)}
		>
			<VisibilitySensor onChange={onVisibilityChange}>
				<Button
					color="inherit"
					size="small"
					startIcon={fetchable.pending ? <CircularProgress size={12} color="inherit" />
								: fetchable.error ? <ErrorOutline />
								: <Refresh />}
					disabled={fetchable.pending}
					onClick={handleClick}
				>
					{fetchable.error
						? '에러 : ' + fetchable.error
						: fetchable.fulfilled ? <span>새로고침 · <DateTime date={fetchable.fetchedAt} relative /></span>
						: '불러오기'}
				</Button>
			</VisibilitySensor>
		</div>
	)
}
