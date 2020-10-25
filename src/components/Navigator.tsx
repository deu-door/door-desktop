import React from 'react';
import { createStyles, makeStyles } from '@material-ui/core/styles';
import Divider from '@material-ui/core/Divider';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';
import HomeIcon from '@material-ui/icons/Home';
import { RootState } from 'store';
import { useSelector } from 'react-redux';
import { Course } from 'service/door/interfaces/course';
import { CourseState } from 'store/modules/courses';
import { useHistory } from 'react-router';
import { Drawer, ListSubheader } from '@material-ui/core';

const drawerWidth = 240;

const useStyles = makeStyles(theme => createStyles({
    drawer: {
      width: drawerWidth
    },
    category: {
      fontWeight: 'bold'
    },
    categoryHeaderPrimary: {
      color: theme.palette.common.white,
    },
    item: {
      paddingTop: 1,
      paddingBottom: 1,
      color: 'rgba(255, 255, 255, 0.7)',
      '&:hover,&:focus': {
        backgroundColor: 'rgba(255, 255, 255, 0.08)',
      },
    },
    itemCategory: {
      // backgroundColor: '#232f3e',
      // backgroundColor: '#2F71E9',
      // boxShadow: '0 -1px 0 #404854 inset',
      paddingTop: theme.spacing(2),
      paddingBottom: theme.spacing(2),
    },
    firebase: {
      fontSize: 24,
	  color: theme.palette.common.white,
	  paddingTop: theme.spacing(4)
    },
    itemActiveItem: {
      color: '#4fc3f7',
    },
    itemPrimary: {
      fontSize: 'inherit',
    },
    itemIcon: {
      minWidth: 'auto',
      marginRight: theme.spacing(2),
    },
    divider: {
      marginTop: theme.spacing(2),
    },
  }));

export const Navigator: React.FC = props => {
  const classes = useStyles();

  const history = useHistory();
  const courses = useSelector<RootState, CourseState>(state => state.courses);
  
  const coursesByCategory: { [key: string]: Course[] } = {};
  courses.categories.forEach(type => coursesByCategory[type] = []);

  Object.values(courses.items).forEach(c => {
    coursesByCategory[c.type] = coursesByCategory[c.type] || [];
    coursesByCategory[c.type].push(c);
  });

  return (
    <Drawer variant="permanent" ModalProps={{ keepMounted: true }} className={classes.drawer} classes={{ paper: classes.drawer }}>
      <List>
        <ListItem>
          Door Desktop
        </ListItem>
        <ListItem>
          <ListItemIcon>
            <HomeIcon />
          </ListItemIcon>
          <ListItemText>
            Project Overview
          </ListItemText>
        </ListItem>
      </List>
      {Object.keys(coursesByCategory).map(category => (
        <React.Fragment key={category}>
          <Divider />
          <List subheader={<ListSubheader component="div" className={classes.category}>{category}</ListSubheader>}>
            {coursesByCategory[category].map(({ id, name, professor }) => (
              <ListItem key={name} button onClick={() => history.push('/main/courses/' + id)}>
                <ListItemText primary={name} secondary={professor}>
                  
                </ListItemText>
              </ListItem>
            ))}
          </List>
        </React.Fragment>
      ))}
    </Drawer>
  );
}