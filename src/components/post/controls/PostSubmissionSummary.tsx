import { Alert, AlertTitle } from '@material-ui/lab';
import { DateTime } from 'components/common/DateTime';
import React from 'react';

export type PostSubmissionSummaryProps = {
	period: {
		from: Date | number | string;
		to: Date | number | string;
	};
};

export const PostSubmissionSummary: React.FC<PostSubmissionSummaryProps> = props => {
	const {
		period: { from, to },
	} = props;

	const duration = new Date(to).valueOf() - new Date(from).valueOf();
	const progress =
		((new Date().valueOf() - new Date(from).valueOf()) / duration) * 100;

	const notStarted = progress < 0;
	const expired = progress >= 100;

	return notStarted ? (
		<Alert severity="info">
			<AlertTitle>
				<DateTime date={from} relative precision="seconds" /> 제출할 수
				있습니다.
			</AlertTitle>
			제출기한: <DateTime date={from} /> ~ <DateTime date={to} />
		</Alert>
	) : expired ? (
		<Alert severity="warning">
			<AlertTitle>제출 기한이 지났습니다.</AlertTitle>
			제출기한: <DateTime date={from} /> ~ <DateTime date={to} />
		</Alert>
	) : (
		<Alert severity="info">
			<AlertTitle>
				<DateTime date={to} relative precision="seconds" /> 제출이
				마감됩니다.
			</AlertTitle>
			제출기한: <DateTime date={from} /> ~ <DateTime date={to} />
		</Alert>
	);
};
