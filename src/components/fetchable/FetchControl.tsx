import { CircularProgress, createStyles, Grid, Link, makeStyles } from '@material-ui/core';
import { ErrorOutline, Refresh } from '@material-ui/icons';
import React from 'react';
import { useDispatch } from 'react-redux';
import { Fetchable } from 'service/door/interfaces';
import { FetchableAction } from 'store/modules';
import clsx from 'clsx';
import VisibilitySensor from 'react-visibility-sensor';
import { DateTime } from 'components/core/DateTime';

const useStyles = makeStyles(theme => createStyles({
	main: {
		display: 'inline-block',
		color: theme.palette.primary.main,
		cursor: 'pointer'
	},
	pending: {
		color: theme.palette.text.secondary,
		cursor: 'unset'
	},
	error: {
		color: theme.palette.error.main
	},
	fetchableProgress: {
		position: 'absolute',
		top: '50%',
		left: '50%',
		marginTop: -10,
		marginLeft: -10
	},
	icon: {
		fontSize: '1rem',
		marginRight: theme.spacing(0.5)
	}
}));

export type FetchControlProps = { fetchable: Fetchable, action?: FetchableAction };

export const FetchControl: React.FC<FetchControlProps & React.HTMLAttributes<HTMLDivElement>> = props => {
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

	const pending = fetchable.pending;
	const error = fetchable.error;

	return (
		<div className={clsx(
			error ? classes.error : undefined,
			pending ? classes.pending : undefined,
			classes.main,
			className
		)}>
			<VisibilitySensor onChange={onVisibilityChange}>
				<Link
					color="inherit"
					underline="always"
					onClick={handleClick}
				>
					<Grid container alignItems="center">
						{pending ? <CircularProgress size={12} color="inherit" className={classes.icon} />
								: error ? <ErrorOutline className={classes.icon} />
								: <Refresh  className={classes.icon} />}

						<Grid item>
							{error ? '에러 : ' + fetchable.error
								: fetchable.fulfilled ? <span>새로고침: <DateTime date={fetchable.fetchedAt} relative /></span>
								: '불러오기'}
						</Grid>
					</Grid>
				</Link>
			</VisibilitySensor>
		</div>
	)
}
