import React from 'react';
import Moment, { MomentProps } from 'react-moment';
import 'moment/locale/ko';
import { Tooltip } from '@material-ui/core';

export type DesktopDateProps = {
	date: Date | string | number;
	tooltip?: boolean;
	tooltipFormat?: string;
} & Omit<MomentProps, 'date'>;

export const DesktopDate: React.FC<DesktopDateProps> = props => {
	const { date, tooltip, tooltipFormat, ...otherProps } = props;

	const momentElement = (
		<Moment
			local
			locale="ko"
			trim
			date={new Date(date)}
			{...(otherProps.fromNow === undefined ? { format: 'LLL' } : {})}
			{...otherProps}
		/>
	);

	return tooltip === true ? (
		<Tooltip placement="top" title={<Moment local locale="ko" trim date={new Date(date)} format={tooltipFormat ?? 'LLL'} />}>
			{momentElement}
		</Tooltip>
	) : (
		momentElement
	);
};
