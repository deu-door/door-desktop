import { Box } from '@material-ui/core';
import React from 'react';

export type DesktopSpacerProps = {
	vertical?: string | number;
	horizontal?: string | number;
};

export const DesktopSpacer: React.FC<DesktopSpacerProps> = props => {
	const { vertical, horizontal } = props;

	return <Box marginTop={vertical} marginLeft={horizontal} />;
};
