import { ListSubheader, styled, withTheme } from '@material-ui/core';

export const DesktopListSubheader = styled(withTheme(ListSubheader))(props => ({
	lineHeight: 'unset',
	paddingLeft: 'unset',
	paddingBottom: props.theme.spacing(1),
	paddingTop: props.theme.spacing(2),
}));
