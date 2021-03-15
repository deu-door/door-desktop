import { Button, Link } from '@material-ui/core';
import React from 'react';
import { IAsyncThunkState } from 'store/modules/util';
import { KeepLatestState } from './KeepLatestState';

export type FetchButtonProps = {
	state: IAsyncThunkState;
	onTriggerFetch?: () => unknown;
	variant: 'link' | 'button' | 'none';
};

export const FetchButton: React.FC<FetchButtonProps> = props => {
	const { children, state, onTriggerFetch, variant } = props;

	return (
		<KeepLatestState state={state} onTriggerFetch={onTriggerFetch}>
			{variant === 'button' ? (
				<Button variant="text" onClick={() => onTriggerFetch?.()}>
					{children}
				</Button>
			) : variant === 'link' ? (
				<Link>{children}</Link>
			) : (
				children
			)}
		</KeepLatestState>
	);
};
