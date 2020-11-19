import React from 'react';
import { createMuiTheme, createStyles, makeStyles, MuiThemeProvider, useMediaQuery } from '@material-ui/core';
import { Routes } from 'Routes';

const useStyles = makeStyles(theme => createStyles({
  root: {
    display: 'flex',
    minHeight: '100vh',
    boxSizing: 'border-box'
  }
}));

const App: React.FC = () => {
  const classes = useStyles();
  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = React.useMemo(() => createMuiTheme({
    palette: {
      // TODO: For dark mode support, edit this line as:
      // prefersDarkMode ? 'dark' : 'light'
      type: prefersDarkMode ? 'dark' : 'light',
      primary: {
        main: '#2F71E9'
      }
    },
    typography: {
      fontFamily: [
        'Noto Sans'
      ].join(',')
    }
  }), [prefersDarkMode]);

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <Routes />
      </div>
    </MuiThemeProvider>
  )
};

export default App;
