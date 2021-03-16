import { Box, BoxProps, CircularProgress, styled } from '@material-ui/core';
import React, { useState } from 'react';
import { IAsyncThunkState } from 'store/modules/util';
import { ErrorOutline, Check, RemoveCircleOutline } from '@material-ui/icons';
import { DateTime } from './DateTime';

const CenterAlignedBox = styled((props: BoxProps) => <Box display="inline-flex" alignItems="center" {...props} />)({
	'& .MuiSvgIcon-root': {
		fontSize: 'inherit',
		marginRight: '0.2rem',
	},
	'& .MuiCircularProgress-root': {
		marginRight: '0.4rem',
	},
});

export type AsyncThunkStateProps = BoxProps & {
	state: IAsyncThunkState | undefined;
	startIcon?: React.ReactNode;
	pending?: React.ReactNode;
	error?: React.ReactNode;
	fulfilled?: React.ReactNode;
	notFulfilled?: React.ReactNode;
};

export const AsyncThunkState: React.FC<AsyncThunkStateProps> = props => {
	const {
		state,
		startIcon,
		pending = '불러오는 중...',
		error = state?.error ?? '오류가 발생하였습니다.',
		fulfilled,
		notFulfilled = '아직 데이터를 불러오지 않았습니다.',
		...otherProps
	} = props;
	const [hover, setHover] = useState(false);

	return state?.pending ? (
		<CenterAlignedBox color="info.main" {...otherProps}>
			{startIcon ?? <CircularProgress size={12} color="inherit" />}
			{pending}
		</CenterAlignedBox>
	) : state?.error ? (
		<CenterAlignedBox color="error.main" {...otherProps}>
			{startIcon ?? <ErrorOutline />}
			{error}
		</CenterAlignedBox>
	) : state?.fulfilledAt ? (
		<CenterAlignedBox color="success.main" {...otherProps}>
			{startIcon ?? <Check />}
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
		<CenterAlignedBox color="warning.main" {...otherProps}>
			{startIcon ?? <RemoveCircleOutline />}
			{notFulfilled}
		</CenterAlignedBox>
	);
};
