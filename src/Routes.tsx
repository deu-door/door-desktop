import { createStyles, Hidden, makeStyles } from '@material-ui/core';
import { BackgroundService } from 'BackgroundService';
import { Navigator } from 'components/Navigator';
import { CoursePage } from 'page/CoursePage';
import { InitializePage } from 'page/InitializePage';
import { LoginPage } from 'page/LoginPage';
import { TimelinePage } from 'page/TimelinePage';
import React, { useEffect } from 'react';
import { useSelector } from 'react-redux';
import { HashRouter as Router, Redirect, Route, Switch, useLocation } from 'react-router-dom';
import { RootState } from 'store/modules';
import { CourseState } from 'store/modules/courses';

const useStyles = makeStyles(theme => createStyles({
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  }
}));

const ScrollToTop: React.FC = props => {
  const { children } = props;
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (<div>{children}</div>);
}

export const Routes: React.FC = () => {
  const classes = useStyles();
  const courses = useSelector<RootState, CourseState>(state => state.courses);

	return (
        <Router>
          <Switch>
            <Route path="/init" component={InitializePage} />
            <Route path="/login" component={LoginPage} />
            <Route path="/main">
              <Hidden xsDown>
                <Navigator />
              </Hidden>
              <Hidden smUp>
                <Navigator />
              </Hidden>
              <div className={classes.main}>
                <Switch>
                  <Route path="/main/timeline" component={TimelinePage} />
                  <ScrollToTop>
                    {Object.values(courses.items).map(course => (
                      <Route key={course.id} path={`/main/courses/${course.id}`} render={() => <CoursePage course={course} />} />
                    ))}
                  </ScrollToTop>
                </Switch>
              </div>
              <BackgroundService />
              <Redirect path="*" to="/main/timeline" />
            </Route>
            <Redirect path="*" to="/init" />
          </Switch>
        </Router>
	);
}