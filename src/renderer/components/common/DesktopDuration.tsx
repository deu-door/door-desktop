import { Tooltip, Typography, TypographyProps } from '@material-ui/core';
import { DesktopDate, DesktopDateProps } from './DesktopDate';
import React, { useEffect, useState } from 'react';
import { runEvery, cancelRun } from '../../../common/helper/schedule';
import { differenceInDays, differenceInMonths } from 'date-fns';

export type DesktopDurationProps = TypographyProps & {
	from: DesktopDateProps['date'];
	to: DesktopDateProps['date'];
	interval?: number;
	tooltip?: boolean;
};

export const DesktopDuration: React.FC<DesktopDurationProps> = props => {
	const { from: _from, to: _to, interval: _interval, tooltip, ...otherProps } = props;

	const from = new Date(_from).valueOf();
	const to = new Date(_to).valueOf();
	const [now, setNow] = useState(Date.now());

	const criteria = now < from ? from : to;

	const diffMonths = Math.abs(differenceInMonths(now, criteria));
	const diffDays = Math.abs(differenceInDays(now, criteria));

	// optimize: if diffDays > 0, not necessary to update so hurry
	const interval = _interval !== undefined ? _interval : diffDays > 0 ? 30000 : 500;

	useEffect(() => {
		const timer = runEvery(() => setNow(Date.now()), interval);

		return () => cancelRun(timer);
	}, [interval]);

	const format = diffMonths > 0 ? 'M월' : diffDays > 0 ? 'd일' : 'hh:mm:ss';

	return (
		<Tooltip
			placement="top"
			title={
				<>
					<DesktopDate date={from} format="M월 D일 a h시 m분" /> ~ <DesktopDate date={to} format="M월 D일 a h시 m분" />
				</>
			}
		>
			<Typography display="inline" variant="subtitle2" {...otherProps} style={{ opacity: from < now && now < to ? 1 : 0.7 }}>
				{to < now ? (
					<>종료되었습니다</>
				) : (
					<>
						<DesktopDate duration={now} date={criteria} format={format} interval={0} />
						{now < from ? '후 제출가능' : ' 남음'}
					</>
				)}
			</Typography>
		</Tooltip>
	);
};
