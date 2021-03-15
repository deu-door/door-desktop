import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Container,
	FormControl,
	FormControlLabel,
	FormHelperText,
	styled,
	TextField,
	TextFieldProps,
	Typography,
} from '@material-ui/core';
import { default as LogoOriginalWhite } from 'resources/logo-original-white.svg';
import React, { useState } from 'react';
import { useUser } from 'hooks/door/useUser';
import { Alert } from '@material-ui/lab';
import { useHistory } from 'react-router';

const LoginTextField = styled((props: TextFieldProps) => <TextField fullWidth variant="outlined" {...props} />)(props => ({
	'& label.Mui-focused': {
		color: props.theme.palette.primary.contrastText,
	},
	'& label': {
		color: props.theme.palette.primary.contrastText,
	},
	'& .MuiOutlinedInput-root:not(.Mui-disabled)': {
		color: props.theme.palette.primary.contrastText,
		'& fieldset': {
			borderColor: props.theme.palette.primary.contrastText,
		},
		'&:hover fieldset': {
			borderColor: props.theme.palette.primary.contrastText,
		},
		'&.Mui-focused fieldset': {
			borderColor: props.theme.palette.primary.contrastText,
		},
	},
	'&:not(:first-child)': {
		marginTop: props.theme.spacing(2),
	},
	'& input[type=password]': {
		fontFamily: 'Malgun gothic',
	},
}));

const LoginCheckbox = styled(Checkbox)(props => ({
	'&:not(.Mui-disabled)': {
		color: props.theme.palette.primary.contrastText,
	},
}));

const AlertFullwidth = styled(Alert)({
	alignSelf: 'stretch',
});

export const LoginPage: React.FC = props => {
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const [autoLogin, setAutoLogin] = useState(false);
	const history = useHistory();
	const { user, login, saveCredential } = useUser();

	const tryLogin = async (event: React.FormEvent<HTMLElement>) => {
		event.preventDefault();

		try {
			await login({ id, password });

			// check using auto login, and save credential
			if (autoLogin) await saveCredential({ id, password });

			// successfully logined
			history.replace('/');
		} catch (e) {}
	};

	return (
		<Box flex={1} display="flex" alignItems="center" justifyContent="center" bgcolor="primary.main" color="primary.contrastText">
			<Container maxWidth="xs">
				<Box component="form" display="flex" flexDirection="column" alignItems="center" onSubmit={tryLogin}>
					<img width="128" alt="logo-original-white" src={LogoOriginalWhite} />

					<Box height="3rem" />

					<Typography variant="h4">환영합니다!</Typography>

					<Box height="2rem" />

					<Typography>Door Desktop을 사용하려면 Door 홈페이지에서 사용하는 아이디와 비밀번호로 로그인해 주세요.</Typography>

					<Box height="1rem" />

					<LoginTextField id="door-id" label="Door ID" disabled={user.pending} onChange={e => setId(e.target.value)} />
					<LoginTextField
						id="door-password"
						label="Door Password"
						type="password"
						disabled={user.pending}
						onChange={e => setPassword(e.target.value)}
					/>

					<Box height="1rem" />

					<FormControlLabel
						control={
							<LoginCheckbox
								checked={autoLogin}
								onChange={event => setAutoLogin(event.target.checked)}
								disabled={user.pending}
							/>
						}
						label="자동 로그인"
					/>

					<Box height="1.2rem">
						{autoLogin && (
							<Typography variant="caption" color="error">
								개인정보 보호를 위해, 개인 PC에서만 사용해 주세요.
							</Typography>
						)}
					</Box>

					<Box height="1rem" />

					{user.error && (
						<>
							<AlertFullwidth variant="filled" severity="error">
								{user.error}
							</AlertFullwidth>
							<Box height="1rem" />
						</>
					)}

					{user.pending ? (
						<CircularProgress color="secondary" />
					) : (
						<Button type="submit" variant="contained" color="secondary" fullWidth>
							<Typography variant="subtitle1">로그인</Typography>
						</Button>
					)}
				</Box>
			</Container>
		</Box>
	);
};
