import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { getSecurelyStoredPassword } from 'service/door/user';
import { RootState } from 'store';
import { login, UserState } from 'store/modules/user';
import { ReactComponent as Logo } from 'resources/logo-original-white.svg';
import { createStyles, makeStyles } from '@material-ui/core';

const useStyles = makeStyles(theme => createStyles({
	main: {
		flex: 1,
		display: 'flex',
		flexDirection: 'column',
		placeItems: 'center',
		placeContent: 'center',
		backgroundColor: '#2F71E9'
	}
}));

export const AutoLoginPage: React.FC = () => {
	const classes = useStyles();
	const user = useSelector<RootState, UserState>(state => state.user);
	const dispatch = useDispatch();
	const history = useHistory();

	const [ triedOnce, setTriedOnce ] = useState(false);

	// try to authorize with saved profile
	useEffect(() => {
		const authorize = async () => {
			if(!user.profile) return history.push('/login');

			const secure = await getSecurelyStoredPassword(user.profile.id);

			// secure was not found
			if(!secure) return history.push('/login');

			await dispatch(login(user.profile.id, secure));

			setTriedOnce(true);
		}
		
		authorize();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	useEffect(() => {
		if(triedOnce) {
			if(user.profile) {
				console.log(`Successfully logined with ${user.profile.id}`);

				history.push('/init');
			}else{
				history.push('/login');
			}
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [triedOnce])

	return (
		<div className={classes.main}>
			<Logo />
		</div>
	);
}