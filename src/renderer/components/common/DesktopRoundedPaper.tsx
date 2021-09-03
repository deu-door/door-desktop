import { Paper, PaperProps, styled, withTheme } from '@material-ui/core';
import React from 'react';

export const DesktopRoundedPaper = styled(withTheme((props: PaperProps) => <Paper elevation={0} {...props} />))(props => ({
	borderRadius: 16,
	paddingTop: props.theme.spacing(0.8),
	paddingBottom: props.theme.spacing(0.8),
}));
