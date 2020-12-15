import { Button, CircularProgress, createStyles, Grid, Link, makeStyles } from '@material-ui/core';
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

export type FetchButtonProps = {
	variant?: 'button' | 'link',
	fetchable: Fetchable,
	action?: FetchableAction
};

export const FetchButton: React.FC<FetchButtonProps & React.HTMLAttributes<HTMLDivElement>> = props => {
	const { className, variant = 'button', fetchable, action } = props;
	const classes = useStyles();
	const dispatch = useDispatch();

	const handleClick = () => action && dispatch(action.fetch());

	const { fulfilled, pending, error, fetchedAt } = fetchable;

	const onVisibilityChange = (isVisible: boolean) => {
		if(action && isVisible && !pending) {
			dispatch(fulfilled ? action.fetchIfExpired() : action.fetchIfNotFulfilled());
		}
	};

	const innerComponent = error ? '에러 : ' + error
						: fulfilled ? <span>새로고침: <DateTime date={fetchedAt} relative /></span>
						: '불러오기';

	return (
		<div className={clsx(
			error ? classes.error : undefined,
			pending ? classes.pending : undefined,
			classes.main,
			className
		)}>
			<VisibilitySensor onChange={onVisibilityChange}>
				{
					variant === 'button' ?
						<Button
							color="inherit"
							size="small"
							startIcon={pending ? <CircularProgress size={12} color="inherit" />
										: error ? <ErrorOutline />
										: <Refresh />}
							disabled={pending}
							onClick={handleClick}
						>{innerComponent}</Button>

					: variant === 'link' ? 
						<Link
							color="inherit"
							underline="always"
							onClick={handleClick}
						>
							<Grid container alignItems="center">
								{pending ? <CircularProgress size={12} color="inherit" className={classes.icon} />
										: error ? <ErrorOutline className={classes.icon} />
										: <Refresh  className={classes.icon} />}
		
								<Grid item>{innerComponent}</Grid>
							</Grid>
						</Link>
					:
						<></>
				}
			</VisibilitySensor>
		</div>
	)
}
