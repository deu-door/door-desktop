import { Backdrop, Button, Checkbox, CircularProgress, Container, createStyles, CssBaseline, FormControlLabel, makeStyles, TextField, Typography } from '@material-ui/core';
import Alert from '@material-ui/lab/Alert';
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { useHistory } from 'react-router';
import { RootState } from 'store';
import { login, UserState } from 'store/modules/user';

const useStyles = makeStyles(theme => createStyles({
	paper: {
		marginTop: theme.spacing(8),
		display: 'flex',
		flexDirection: 'column',
		placeItems: 'center'
	},
	form: {
		width: '100%',
		marginTop: theme.spacing(3)
	},
	submit: {
		margin: theme.spacing(3, 0, 2)
	}
}));

export const LoginPage: React.FC = props => {
	const classes = useStyles();

	const user = useSelector<RootState, UserState>(state => state.user);
	const dispatch = useDispatch();
	const history = useHistory();

	const [username, setUsername] = useState('');
	const [password, setPassword] = useState('');
	const [saveCredential, setSaveCredential] = useState(true);
	const [validate, setValidate] = useState(false);

	const handleSubmit = async (e: React.FormEvent<EventTarget>) => {
		e.preventDefault();

		await dispatch(login(username, password, { saveCredential }));

		setValidate(true);
	};

	useEffect(() => {
		if(validate){
			if(user.profile) history.push('/init');

			setValidate(false);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [validate]);

	return (
		<Container component="main" maxWidth="xs">
			<CssBaseline />
			<div className={classes.paper}>
				<Typography component="h1" variant="h5">
					Sign in
				</Typography>

				<form
					className={classes.form}
					onSubmit={handleSubmit}
				>
					{/* Redirect to /init if login succeed */}
					{/*  user.profile ? <Redirect to="/init" /> : null */}
					{/* Show error message when login failed */}
					{ user.error ? <Alert variant="filled" severity="error">{user.error}</Alert> : null }

					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						id="id"
						label="학번"
						name="id"
						autoFocus
						disabled={user.pending}
						onChange={e => setUsername(e.target.value)}
					/>
					<TextField
						variant="outlined"
						margin="normal"
						required
						fullWidth
						type="password"
						id="password"
						label="비밀번호"
						name="password"
						autoComplete="current-password"
						disabled={user.pending}
						onChange={e => setPassword(e.target.value)}
					/>
					<FormControlLabel
						control={
							<Checkbox
								color="primary"
								checked={saveCredential}
								onChange={e => setSaveCredential(e.target.checked)}
							/>
						}
						label="자동 로그인"
					/>
					<Button
						type="submit"
						fullWidth
						variant="contained"
						color="primary"
						disabled={user.pending}
						className={classes.submit}
					>
						로그인
					</Button>
				</form>
			</div>
			<Backdrop open={!!user.pending}>
				<CircularProgress color="inherit" />
			</Backdrop>
		</Container>
	);
};
