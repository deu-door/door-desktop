import { createStyles, Hidden, makeStyles } from '@material-ui/core';
import { BackgroundService } from 'BackgroundService';
import { Navigator } from 'components/Navigator';
import { AutoLoginPage } from 'page/AutoLoginPage';
import { CoursePage } from 'page/CoursePage';
import { DashboardPage } from 'page/DashboardPage';
import { InitializePage } from 'page/InitializePage';
import { LoginPage } from 'page/LoginPage';
import React from 'react';
import { HashRouter as Router, Redirect, Route, Switch } from 'react-router-dom';

const useStyles = makeStyles(theme => createStyles({
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  }
}));

export const Routes: React.FC = () => {
	const classes = useStyles();

	return (
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
              <BackgroundService />
            </Route>
            <Redirect path="*" to="/autologin" />
          </Switch>
        </Router>
	);
}