import React from 'react';
import Moment, { MomentProps } from 'react-moment';
import 'moment/locale/ko';

export type DateTimeProps = {
	date: Date | string | number;
} & Omit<MomentProps, 'date'>;

export const DateTime: React.FC<DateTimeProps> = props => {
	const { date, ...otherProps } = props;

	return <Moment local locale="ko" trim date={new Date(date)} {...otherProps} />;
};
