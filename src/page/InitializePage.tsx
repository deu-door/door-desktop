import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { getSecurelyStoredPassword } from 'service/door/user';
import { RootState } from 'store/modules';
import { UserState } from 'store/modules/user';
import { ReactComponent as Logo } from 'resources/logo-original-white.svg';
import { Container, createStyles, Grid, LinearProgress, makeStyles, Typography } from '@material-ui/core';
import { actions } from 'store/modules';
import { CourseFetchIterator } from 'store/background';

const useStyles = makeStyles(theme => createStyles({
	main: {
		flex: 1,
		backgroundColor: theme.palette.primary.main
	},
	title: {
		color: theme.palette.primary.contrastText,
		marginTop: theme.spacing(3)
	},
	subtitle: {
		color: theme.palette.primary.contrastText,
		marginTop: theme.spacing(2)
	},
	progress: {
		color: theme.palette.primary.contrastText,
		width: '100%',
		marginTop: theme.spacing(3)
	}
}));

export const InitializePage: React.FC = () => {
	const classes = useStyles();
	const user = useSelector<RootState, UserState>(state => state.user);
	const [title, setTitle] = useState('');
	const [subtitle, setSubtitle] = useState('');
	const dispatch = useDispatch();
	const history = useHistory();

	useEffect(() => {
		const authorize = async () => {
			if(!user.profile) return history.push('/login');

			const secure = await getSecurelyStoredPassword(user.profile.id);

			// secure was not found
			if(!secure) return history.push('/login');

			setTitle('Door Desktop');
			setSubtitle('자동 로그인 중...');
			await dispatch(actions.login(user.profile.id, secure).fetch());
		}

		if(user.error) {
			dispatch(actions.login('', '').clear());

			history.push('/login');
			return;
		}
		
		if(!user.authenticated) {
			authorize();
			return;
		}

		console.log(`Successfully logined with ${user.profile?.id}`);
		
		// 로그인 후 최소한의 데이터가 갖추어져있는지 확인.
		// 데이터가 없다면 fetch
		const fetch = async () => {
			const iterator = new CourseFetchIterator();

			let next;
			do {
				next = iterator.next();

				if(next.value) {
					setTitle(next.value.title);
					setSubtitle(next.value.subtitle || '');
					await dispatch(next.value.action.fetchIfNotFulfilled());
				}
			} while(!next.done)

			history.push('/main');
		}

		fetch();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [user.error, user.authenticated]);

	return (
		<Grid container alignItems="center" justify="center" className={classes.main}>
			<Container maxWidth="xs">
				<Grid item container direction="column" alignItems="center">
					<Logo />
					<Typography variant="h4" className={classes.title}>{title}</Typography>
					<Typography variant="h6" className={classes.subtitle}>{subtitle}</Typography>
					<LinearProgress className={classes.progress} />
				</Grid>
			</Container>
		</Grid>
	);
}