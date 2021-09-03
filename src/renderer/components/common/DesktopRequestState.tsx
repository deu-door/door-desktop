import { Box, BoxProps, CircularProgress, styled } from '@material-ui/core';
import React, { useState } from 'react';
import { ErrorOutline, RemoveCircleOutline, Sync } from '@material-ui/icons';
import { DesktopDate } from './DesktopDate';
import { useRequestMetadata } from '../../hooks/request/useRequestMetadata';

const CenterAlignedBox = styled((props: BoxProps) => <Box display="inline-flex" alignItems="center" {...props} />)({
	'& .MuiSvgIcon-root': {
		fontSize: 'inherit',
		marginRight: '0.2rem',
	},
	'& .MuiCircularProgress-root': {
		marginRight: '0.4rem',
	},
});

export type DesktopRequestStateProps = BoxProps & {
	uri: string;
	startIcon?: React.ReactNode;
	messages?: {
		pending?: React.ReactNode;
		error?: React.ReactNode;
		fulfilled?: React.ReactNode;
		notFulfilled?: React.ReactNode;
	};
};

export const DesktopRequestState: React.FC<DesktopRequestStateProps> = props => {
	const { uri, startIcon, messages, ...otherProps } = props;
	const [hover, setHover] = useState(false);

	const { requestMetadataByURI } = useRequestMetadata();
	const requestMetadata = requestMetadataByURI(uri);

	const {
		pending = '불러오는 중...',
		error = requestMetadata.error ?? '오류가 발생하였습니다.',
		fulfilled,
		notFulfilled = '아직 데이터를 불러오지 않았습니다.',
	} = messages ?? {};

	return requestMetadata.pending ? (
		<CenterAlignedBox color="info.main" {...otherProps}>
			{startIcon ?? <CircularProgress size={12} color="inherit" />}
			<Box paddingY={0.3}>{pending}</Box>
		</CenterAlignedBox>
	) : requestMetadata.error ? (
		<CenterAlignedBox color="error.main" {...otherProps}>
			{startIcon ?? <ErrorOutline />}
			<Box paddingY={0.3}>{error}</Box>
		</CenterAlignedBox>
	) : requestMetadata.fulfilled ? (
		<CenterAlignedBox color="success.main" {...otherProps}>
			{startIcon ?? <Sync />}
			{fulfilled ?? (
				<Box paddingY={0.3}>
					<span onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
						<DesktopDate
							date={new Date(requestMetadata.fulfilledAt ?? 'Invalid Date')}
							{...(hover ? { format: 'YYYY년 M월 D일 A h시 m분' } : { fromNow: true })}
						/>
					</span>
					에 업데이트하였음
				</Box>
			)}
		</CenterAlignedBox>
	) : (
		<CenterAlignedBox color="warning.main" {...otherProps}>
			{startIcon ?? <RemoveCircleOutline />}
			<Box paddingY={0.3}>{notFulfilled}</Box>
		</CenterAlignedBox>
	);
};
