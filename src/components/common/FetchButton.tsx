import { Button, Link, LinkProps, styled } from '@material-ui/core';
import React from 'react';
import { IAsyncThunkState } from 'store/modules/util';
import { AsyncThunkState } from './AsyncThunkState';

const FetchLink = styled((props: LinkProps) => <Link component="a" {...props} />)({
	'&:hover': {
		textDecoration: 'none',
	},
	cursor: 'pointer',
});

export type FetchButtonProps = {
	state: IAsyncThunkState | undefined;
	onFetch?: () => unknown;
	variant?: 'link' | 'button' | 'none';
};

export const FetchButton: React.FC<FetchButtonProps> = props => {
	const { children: _children, state, onFetch, variant = 'link' } = props;

	const onClick = () => {
		if (state?.pending === true) return;

		onFetch?.();
	};

	const children = _children ?? <AsyncThunkState state={state} />;

	return variant === 'button' ? (
		<Button variant="text" onClick={onClick}>
			{children}
		</Button>
	) : variant === 'link' ? (
		<FetchLink onClick={onClick}>{children}</FetchLink>
	) : (
		<span onClick={onClick}>{children}</span>
	);
};
