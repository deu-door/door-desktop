import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import { useSelector } from 'react-redux';
import { Course } from 'service/door/interfaces/course';
import { CourseState } from 'store/modules/courses';
import { useHistory, useLocation } from 'react-router';
import { Drawer, Grid, ListSubheader, SvgIcon, Typography } from '@material-ui/core';
import { RootState } from 'store/modules';
import { ReactComponent as DoorIcon } from 'resources/logo-original-white.svg';
import clsx from 'clsx';

const drawerWidth = 240;

const useStyles = makeStyles(theme => createStyles({
    drawer: {
      width: drawerWidth,
      background: '#18202c',
      color: 'rgba(255, 255, 255, 0.7)'
    },
    divider: {
      background: '#404854'
    },
    category: {
      color: theme.palette.common.white,
      fontWeight: 'bold'
    },
    header: {
      backgroundColor: '#232f3e',
      color: theme.palette.common.white,
      '&:hover,&:focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)'
      }
    },
    headerIcon: {
      width: '3rem',
      height: '3rem'
    },
    headerText: {
      fontWeight: 'bold'
    },
    item: {
      color: 'rgba(255, 255, 255, 0.8)',
      '&:hover,&:focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
      paddingTop: theme.spacing(1),
      paddingBottom: theme.spacing(1)
    },
    itemActive: {
      color: '#4fc3f7'
    },
    itemTitle: {
      fontWeight: 'bolder'
    },
    itemSubtitle: {
      color: 'rgba(255, 255, 255, 0.7)'
    }
  }));

export const Navigator: React.FC = props => {
  const classes = useStyles();

  const history = useHistory();
  const location = useLocation();
  const courses = useSelector<RootState, CourseState>(state => state.courses);
  
  const coursesByCategory: { [key: string]: Course[] } = {};
  courses.categories.forEach(type => coursesByCategory[type] = []);

  Object.values(courses.items).forEach(c => {
    coursesByCategory[c.type] = coursesByCategory[c.type] || [];
    coursesByCategory[c.type].push(c);
  });

  return (
    <Drawer variant="permanent" ModalProps={{ keepMounted: true }} className={classes.drawer} classes={{ paper: classes.drawer }}>
      <List disablePadding>
        <ListItem
          button
          className={classes.header}
          onClick={() => history.push('/main/timeline')}
        >
          <Grid container spacing={3} alignItems="center">
            <Grid item>
              <SvgIcon viewBox="0 0 245 245" className={classes.headerIcon}>
                <DoorIcon />
              </SvgIcon>
            </Grid>
            <Grid
              item
              style={{ flex: 1 }}
              container
              direction="column"
              className={classes.headerText}
            >
              <Grid item>
                <Typography variant="h4">Door</Typography>
              </Grid>
              <Grid item>
                <Typography variant="subtitle1">Desktop</Typography>
              </Grid>
            </Grid>
          </Grid>
        </ListItem>
      </List>
      {Object.keys(coursesByCategory).map(category => (
        <React.Fragment key={category}>
          <Divider className={classes.divider} />
          <List subheader={
            <ListSubheader component="div" className={classes.category}>{category}</ListSubheader>
          }>
            {coursesByCategory[category].map(({ id, name, professor }) => {
              const path = '/main/courses/' + id;

              return (<ListItem
                key={name}
                button
                className={clsx(classes.item, location.pathname === path && classes.itemActive)}
                onClick={() => history.push(path)}
              >
                <ListItemText>
                  <Typography variant="subtitle1" className={classes.itemTitle}>{name}</Typography>
                  <Typography variant="subtitle2" className={classes.itemSubtitle}>{professor}</Typography>
                </ListItemText>
              </ListItem>);
            })}
          </List>
        </React.Fragment>
      ))}
    </Drawer>
  );
}