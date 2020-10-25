import React from 'react';
import './App.css';
import { createMuiTheme, createStyles, Hidden, makeStyles, MuiThemeProvider, ThemeProvider, useMediaQuery } from '@material-ui/core';
import { LoginPage } from 'page/LoginPage';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';
import { DashboardPage } from 'page/DashboardPage';
import { CoursePage } from 'page/CoursePage';
import { InitializePage } from 'page/InitializePage';
import { Navigator } from 'components/Navigator';
import { AutoLoginPage } from 'page/AutoLoginPage';

const theme = createMuiTheme({
  typography: {
    fontFamily: [
      'Noto Sans'
    ].join(',')
  },
  palette: {
    // background: {
    //   default: '#2F71E9'
    // }
  }
});

const useStyles = makeStyles(theme => createStyles({
  root: {
    display: 'flex',
    minHeight: '100vh',
    boxSizing: 'border-box'
  },
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  }
}));

const Routes: React.FC = () => {
  const classes = useStyles();

  return (
    <MuiThemeProvider theme={theme}>
      <div className={classes.root}>
        <Router>
          <Switch>
            <Route path="/autologin" component={AutoLoginPage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/init" component={InitializePage} />
            <Route path="/main">
              <Hidden xsDown>
                <Navigator />
              </Hidden>
              <Hidden smUp>
                <Navigator />
              </Hidden>
              <div className={classes.main}>
                <Switch>
                  <Route path="/main/dashboard" component={DashboardPage} />
                  <Route path="/main/courses/:courseId" component={CoursePage} />
                  <Redirect path="*" to="/main/dashboard" />
                </Switch>
              </div>
            </Route>
            <Redirect path="*" to="/autologin" />
          </Switch>
        </Router>
      </div>
    </MuiThemeProvider>
  );
};

const App: React.FC = () => {

  const prefersDarkMode = useMediaQuery('(prefers-color-scheme: dark)');
  
  const theme = React.useMemo(
    () => createMuiTheme({
      palette: {
        type: prefersDarkMode ? 'dark' : 'light'
      }
    }),
    [prefersDarkMode]
  );

  return (
    <ThemeProvider theme={theme}>
      <Routes />
    </ThemeProvider>
  )
};

export default App;
