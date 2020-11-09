import { createStyles, CssBaseline, Grid, Hidden, makeStyles, Paper, SvgIcon, Typography } from '@material-ui/core';
import { BackgroundService } from 'BackgroundService';
import { Downloads } from 'components/Downloads';
import { KeepAlive } from 'components/KeepAlive';
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
import { ReactComponent as Logo } from 'resources/logo-original-white.svg';

const useStyles = makeStyles(theme => createStyles({
  main: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column'
  },
  temporalDashboard: {
    width: '100%',
    height: '100%'
  }
}));

const ScrollToTop: React.FC = props => {
  const { children } = props;
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  return (<>{children}</>);
}

const TemporalDashboard: React.FC = props => {
  const classes = useStyles();

  return (
    <Grid container className={classes.temporalDashboard} alignItems="center" justify="center" direction="column" spacing={3}>
      <CssBaseline />
      <Grid item>
        <Logo />
      </Grid>
      <Grid item>
        <Typography variant="h4" color="textSecondary">왼쪽 목록에서 강의를 선택할 수 있습니다</Typography>
      </Grid>
    </Grid>
  );
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
              <Navigator />
              <div className={classes.main}>
                <Switch>
                  {/* <Route path="/main/timeline" component={TimelinePage} /> */}
                  <ScrollToTop>
                    {Object.values(courses.items).map(course => (
                      <Route key={course.id} path={`/main/courses/${course.id}`} render={() => <CoursePage course={course} />} />
                    ))}
                    <Route path="/main/dashboard" component={TemporalDashboard} />
                  </ScrollToTop>
                </Switch>
              </div>

              <Downloads />
              <BackgroundService />
              <KeepAlive />
            </Route>
            <Redirect to="/init" />
          </Switch>
        </Router>
	);
}