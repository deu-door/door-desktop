import { Button, Link, LinkProps, styled } from '@material-ui/core';
import React from 'react';
import { useRequestMetadata } from '../../hooks/request/useRequestMetadata';
import { DesktopRequestState } from './DesktopRequestState';

const DesktopRequestLink = styled((props: LinkProps) => <Link component="a" {...props} />)({
	'&:hover': {
		textDecoration: 'none',
	},
	cursor: 'pointer',
});

export type DeDesktopRequestButtonProps = {
	uri: string;
	onClick?: () => unknown;
	variant?: 'link' | 'button' | 'none';
};

export const DesktopRequestButton: React.FC<DeDesktopRequestButtonProps> = props => {
	const { children: _children, uri, onClick, variant = 'link' } = props;

	const { requestMetadataByURI } = useRequestMetadata();
	const requestMetadata = requestMetadataByURI(uri);

	const onClickWrapper = () => {
		if (requestMetadata.pending === true) return;

		onClick?.();
	};

	const children = _children ?? <DesktopRequestState uri={uri} />;

	return variant === 'button' ? (
		<Button variant="text" onClick={onClick}>
			{children}
		</Button>
	) : variant === 'link' ? (
		<DesktopRequestLink onClick={onClickWrapper}>{children}</DesktopRequestLink>
	) : (
		<span onClick={onClickWrapper}>{children}</span>
	);
};
