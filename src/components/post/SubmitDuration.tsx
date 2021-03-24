import { Box, Typography, TypographyProps } from '@material-ui/core';
import { DateTime, DateTimeProps } from 'components/common/DateTime';
import { Due } from 'models/door';
import React, { useEffect, useState } from 'react';

export type DurationProps = TypographyProps & {
	from: DateTimeProps['date'];
	to: DateTimeProps['date'];
	interval?: number;
};

export const Duration: React.FC<DurationProps> = props => {
	const { from: _from, to: _to, interval = 500, ...otherProps } = props;

	const from = new Date(_from).valueOf();
	const to = new Date(_to).valueOf();

	const [hover, setHover] = useState(false);
	const [now, setNow] = useState(Date.now());

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), interval);

		return () => clearInterval(timer);
	}, [interval]);

	return (
		<Box onMouseEnter={() => setHover(true)} onMouseLeave={() => setHover(false)} display="inline-block">
			<Typography variant="subtitle2" {...otherProps} style={{ opacity: from < now && now < to ? 1 : 0.7 }}>
				{hover ? (
					<>
						<DateTime date={from} format="M월 D일 a h시 m분" /> ~ <DateTime date={to} format="M월 D일 a h시 m분" />
					</>
				) : now < from ? (
					<>
						<DateTime duration={now} date={from} format="D일 h시간 m분 s초" interval={0} />후 제출가능
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

export type SubmitDurationProps = {
	duration: Due['duration'];
	additionalDuration?: Due['additionalDuration'];
	interval?: number;
};

export const SubmitDuration: React.FC<SubmitDurationProps> = props => {
	const { duration, additionalDuration, interval } = props;

	return (
		<Box display="flex" flexDirection="column" alignItems="flex-end">
			<Duration interval={interval} {...duration} {...(additionalDuration !== undefined ? { variant: 'caption' } : {})} />
			{additionalDuration && (
				<Box>
					<Typography variant="caption" display="inline">
						추가 제출기간:{' '}
					</Typography>
					<Duration interval={interval} {...additionalDuration} />
				</Box>
			)}
		</Box>
	);
};
