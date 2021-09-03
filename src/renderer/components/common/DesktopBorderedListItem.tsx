import { ListItem, styled } from '@material-ui/core';

export const DesktopBorderedListItem = styled(ListItem)({
	borderTop: '1px solid #E0E0E0',
	paddingTop: 0,
	paddingBottom: 0,

	'&:last-child': {
		borderBottom: '1px solid #E0E0E0',
	},
});
