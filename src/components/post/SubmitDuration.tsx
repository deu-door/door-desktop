import { Box, Typography, TypographyProps } from '@material-ui/core';
import { DateTime, DateTimeProps } from 'components/common/DateTime';
import React, { useEffect, useState } from 'react';

export type SubmitDurationProps = TypographyProps & {
	from: DateTimeProps['date'];
	to: DateTimeProps['date'];
	interval?: number;
};

export const SubmitDuration: React.FC<SubmitDurationProps> = props => {
	const { from: _from, to: _to, interval = 100, ...otherProps } = props;
	const [hover, setHover] = useState(false);
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), interval);

		return () => clearInterval(timer);
	}, [interval]);

	const from = new Date(_from).valueOf();
	const to = new Date(_to).valueOf();

	return (
		<Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)}>
			<Typography variant="subtitle2" {...otherProps}>
				{hover ? (
					<>
						<DateTime date={from} format="M월 D일 h시 m분" /> ~ <DateTime date={to} format="M월 D일 h시 m분" />
					</>
				) : now < from ? (
					<>
						<DateTime date={from} durationFromNow format="D일 h시간 m분 s초" interval={0} />후 제출가능
					</>
				) : now < to ? (
					<>
						<DateTime duration={now} date={to} format="D일 h시간 m분 s초" interval={0} /> 남음
					</>
				) : (
					<>종료되었습니다</>
				)}
			</Typography>
		</Box>
	);
};
