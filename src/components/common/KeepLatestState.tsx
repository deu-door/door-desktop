import React, { useEffect, useState } from 'react';
import { IAsyncThunkState } from 'store/modules/util';

export type KeepLatestStateProps = {
	expirationInterval?: number;
	state: IAsyncThunkState | undefined;
	onTriggerFetch?: () => unknown;
};

export const KeepLatestState: React.FC<KeepLatestStateProps> = props => {
	const { children, expirationInterval = 30 * 60 * 1000, state, onTriggerFetch } = props;
	const [triggeredOnce, setTriggeredOnce] = useState(false);

	const trigger = () => {
		console.log('Trigger fetch: ', state);
		onTriggerFetch?.();
		setTriggeredOnce(true);
	};

	const checkTriggerCondition = () => {
		if (onTriggerFetch !== undefined) {
			if (state === undefined) {
				trigger();
				return;
			}

			if (state?.pending) return;

			if (triggeredOnce && state.error !== undefined) return;

			// check state is expired
			if (state?.fulfilledAt === undefined || expirationInterval < Date.now() - new Date(state.fulfilledAt).valueOf()) {
				trigger();
			}
		}
	};

	// eslint-disable-next-line react-hooks/exhaustive-deps
	useEffect(() => checkTriggerCondition(), [state]);

	return <>{children}</>;
};
