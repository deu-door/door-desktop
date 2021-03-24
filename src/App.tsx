import React, { useEffect } from 'react';
import { Box, createMuiTheme, CssBaseline, MuiThemeProvider, useMediaQuery } from '@material-ui/core';
import { Routes } from 'Routes';
import { useOnlineResources } from 'hooks/online-resources/useOnlineResources';

const App: React.FC = () => {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

	const defaultFontFamily = ['NanumSquareRound'].join(',');
	const headingFontFamily = ['NanumSquare'].join(',');

	const theme = React.useMemo(
		() =>
			createMuiTheme({
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
									paper: '#fafafa',
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
			}),
		// eslint-disable-next-line react-hooks/exhaustive-deps
		[prefersDarkMode],
	);

	// Load online resources
	const { fetchExternalLinks, fetchSplashTexts } = useOnlineResources();

	useEffect(() => {
		setTimeout(() => {
			fetchExternalLinks();
			fetchSplashTexts();
		}, 5 * 1000);
	}, []);

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
