import React, { useEffect, useState } from 'react';
import moment from 'moment';
import 'moment/locale/ko';

moment.locale('ko', {
	relativeTime: {
		s: '방금'
	}
});

const FORMAT_DATE = 'MMM Do';
const FORMAT_TIME = 'MMM Do a h:mm';

type DateTimeProps = {
	date?: Date|string|number,
	relative?: boolean,
	precision?: 'days' | 'seconds'
};

export const DateTime: React.FC<DateTimeProps> = props => {
	const { date, relative = false, precision = 'seconds' } = props;
	const getRelativeTime =
		relative ? (
			precision === 'days' ? () => moment(date).calendar(null, {
					lastDay: '[어제]',
					sameDay: '[오늘]',
					nextDay: '[내일]',
					lastWeek: '[지난 주] dddd',
					nextWeek: 'dddd',
					sameElse: FORMAT_DATE
				})
			: precision === 'seconds' ? () => moment(date).fromNow()
			// fallback
			: () => moment(date).fromNow()
		) : (
			precision === 'days' ? () => moment(date).format(FORMAT_DATE)
			: precision === 'seconds' ? () => moment(date).format(FORMAT_TIME)
			// fallback
			: () => moment(date).format(FORMAT_TIME)
		);

	const [text, setText] = useState('');

	useEffect(() => {
		const timer = setInterval(() => {
			setText(getRelativeTime());
		}, 1000);

		return () => clearInterval(timer);
	});

	useEffect(() => setText(getRelativeTime()), [date]);

	return (
		<span>{text}</span>
	);
}
