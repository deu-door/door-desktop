import React from 'react';
import { Box, createMuiTheme, CssBaseline, MuiThemeProvider, useMediaQuery } from '@material-ui/core';
import { Routes } from 'Routes';

const App: React.FC = () => {
	const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');

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
					fontFamily: ['NanumSquare', 'Noto Sans'].join(','),
				},
			}),
		[prefersDarkMode],
	);

	return (
		<MuiThemeProvider theme={theme}>
			<CssBaseline />
			<Box display="flex" height="100vh" boxSizing="border-box">
				<Routes />
			</Box>
		</MuiThemeProvider>
	);
};

export default App;
