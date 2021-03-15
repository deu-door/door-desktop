import { Box, BoxProps, CircularProgress, createStyles, makeStyles } from '@material-ui/core';
import React, { useState } from 'react';
import { IAsyncThunkState } from 'store/modules/util';
import { ErrorOutline, Check, RemoveCircleOutline } from '@material-ui/icons';
import { DateTime } from './DateTime';

const useStyles = makeStyles(theme =>
	createStyles({
		icon: {
			fontSize: 'inherit',
			marginRight: theme.spacing(0.5),
		},
	}),
);

const CenterAlignedBox = (props: BoxProps) => <Box display="inline-flex" alignItems="center" {...props} />;

export type AsyncThunkStateProps = {
	state: IAsyncThunkState | undefined;
	pending?: React.ReactNode;
	error?: React.ReactNode;
	fulfilled?: React.ReactNode;
	notFulfilled?: React.ReactNode;
};

export const AsyncThunkState: React.FC<AsyncThunkStateProps> = props => {
	const {
		state,
		pending = '불러오는 중...',
		error = state?.error ?? '오류가 발생하였습니다.',
		fulfilled,
		notFulfilled = '아직 데이터를 불러오지 않았습니다.',
	} = props;
	const classes = useStyles();
	const [hover, setHover] = useState(false);

	return state?.pending ? (
		<CenterAlignedBox color="info.main">
			<CircularProgress className={classes.icon} size={12} color="inherit" />
			{pending}
		</CenterAlignedBox>
	) : state?.error ? (
		<CenterAlignedBox color="error.main">
			<ErrorOutline className={classes.icon} />
			{error}
		</CenterAlignedBox>
	) : state?.fulfilledAt ? (
		<CenterAlignedBox color="success.main">
			<Check className={classes.icon} />
			{fulfilled ?? (
				<>
					<span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
						<DateTime date={state.fulfilledAt} {...(hover ? { format: 'YYYY년 M월 D일 A h시 m분' } : { fromNow: true })} />
					</span>
					에 업데이트하였음
				</>
			)}
		</CenterAlignedBox>
	) : (
		<CenterAlignedBox color="warning.main">
			<RemoveCircleOutline className={classes.icon} />
			{notFulfilled}
		</CenterAlignedBox>
	);
};
