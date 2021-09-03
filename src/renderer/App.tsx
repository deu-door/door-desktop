import React from 'react';
import { Box, createTheme, CssBaseline, MuiThemeProvider, useMediaQuery } from '@material-ui/core';
import { Color, Titlebar } from 'custom-electron-titlebar';
import '../static/fonts/nanum-square/index.css';
import '../static/fonts/nanum-square-round/index.css';
import Routes from './Routes';

const defaultFontFamily = ['nanum-square-round'].join(',');
const headingFontFamily = ['nanum-square'].join(',');

const createDoorDesktopTheme = (prefersDarkMode: boolean) =>
	createTheme({
		palette: {
			primary: {
				main: '#2F71E9',
			},

			...(prefersDarkMode
				? {
						type: 'dark',
				  }
				: {
						type: 'light',
						background: {
							default: '#ffffff',
							paper: '#f6f7f8',
						},
				  }),
		},
		typography: {
			h1: { fontFamily: headingFontFamily },
			h2: { fontFamily: headingFontFamily },
			h3: { fontFamily: headingFontFamily },
			h4: { fontFamily: headingFontFamily },
			h5: { fontFamily: headingFontFamily },
			h6: { fontFamily: headingFontFamily },

			subtitle1: { fontFamily: defaultFontFamily },
			subtitle2: { fontFamily: defaultFontFamily },

			body1: { fontFamily: defaultFontFamily },
			body2: { fontFamily: defaultFontFamily },

			button: { fontFamily: defaultFontFamily },
			caption: { fontFamily: defaultFontFamily },
			overline: { fontFamily: defaultFontFamily },
		},
	});

const App: React.FC = () => {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const theme = React.useMemo(() => createDoorDesktopTheme(prefersDarkMode), [prefersDarkMode]);

	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			<Box display="flex" height="100%" boxSizing="border-box">
				<Routes />
			</Box>
		</MuiThemeProvider>
	);
};

export default App;

const titlebar = new Titlebar({
	backgroundColor: Color.fromHex('#204fa3'),
	menu: undefined,
	unfocusEffect: false,
});

document.title = 'Door Desktop';
titlebar.updateTitle();
