import {
	Box,
	Button,
	Checkbox,
	CircularProgress,
	Container,
	createStyles,
	FormControlLabel,
	makeStyles,
	styled,
	TextField,
	TextFieldProps,
	Typography,
} from '@material-ui/core';
import { default as IconOriginal } from '../../static/icon/icon-original.svg';
import React, { useEffect, useState } from 'react';
import { Alert } from '@material-ui/lab';
import { useUser } from '../hooks/door/useUser';
import { useRequestMetadata } from '../hooks/request/useRequestMetadata';
import { userLoginURI } from '../../common/uri/uri';
import { Redirect, RouteComponentProps } from 'react-router';
import { DesktopSpacer } from '../components/common/DesktopSpacer';

const useStyles = makeStyles(theme =>
	createStyles({
		breathIcon: {
			animation: `$breathAnimation 6s infinite`,
		},
		'@keyframes breathAnimation': {
			'0%': {
				filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
			},
			'50%': {
				filter: 'drop-shadow(0 0 50px rgba(255, 255, 255, 0.9))',
			},
			'100%': {
				filter: 'drop-shadow(0 0 30px rgba(255, 255, 255, 0.4))',
			},
		},
	}),
);

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

export type DesktopLoginPageProps = RouteComponentProps;

export const DesktopLoginPage: React.FC<DesktopLoginPageProps> = props => {
	const classes = useStyles();
	const [capsLockPressed, setCapsLockPressed] = useState(false);
	const [id, setId] = useState('');
	const [password, setPassword] = useState('');
	const { user, sessionExpired, persistCredential, setPersistCredential, login, ensureLoginState } = useUser();

	const { requestMetadataByURI } = useRequestMetadata();
	const { pending, error } = requestMetadataByURI(userLoginURI());

	// does session really expired? check once
	useEffect(() => {
		ensureLoginState();
	}, []);

	const detectCapsLockPressed = (event: React.KeyboardEvent) => {
		setCapsLockPressed(event.getModifierState('CapsLock'));
	};

	const tryLogin = async (event: React.FormEvent<HTMLElement>) => {
		event.preventDefault();

		login(id, password);
	};

	if (user !== undefined && sessionExpired !== true) return <Redirect to="/" />;

	return (
		<Box
			flex={1}
			display="flex"
			alignItems="center"
			justifyContent="center"
			color="primary.contrastText"
			style={{
				background: 'linear-gradient(#2F71E9, 40%, #1657d0)',
			}}
		>
			<Container maxWidth="xs">
				<Box component="form" display="flex" flexDirection="column" alignItems="center" onSubmit={tryLogin}>
					<img className={classes.breathIcon} width="128px" alt="icon-original" src={IconOriginal} />

					<DesktopSpacer vertical={1.8} />

					<Typography variant="h5">환영합니다!</Typography>

					<DesktopSpacer vertical={4} />

					<Typography variant="subtitle1">
						Door Desktop을 사용하려면 Door 홈페이지에서 사용하는 아이디와 비밀번호로 로그인해 주세요.
					</Typography>

					<LoginTextField id="door-id" label="Door ID" disabled={pending} onChange={e => setId(e.target.value)} />
					<LoginTextField
						id="door-password"
						label="Door Password"
						type="password"
						disabled={pending}
						onChange={e => setPassword(e.target.value)}
						onBlur={() => setCapsLockPressed(false)}
						onKeyDown={detectCapsLockPressed}
						error={capsLockPressed}
						helperText={capsLockPressed ? 'CapsLock이 켜져 있습니다' : ' '}
					/>

					<FormControlLabel
						control={
							<LoginCheckbox
								checked={persistCredential}
								onChange={({ target: { checked } }) => setPersistCredential(checked)}
								disabled={pending}
							/>
						}
						label="로그인 상태 유지"
					/>

					<DesktopSpacer vertical={0.5} />
					<Box visibility={persistCredential ? 'visible' : 'hidden'}>
						<Typography variant="caption" color="error">
							개인정보 보호를 위해, 개인 PC에서만 사용해 주세요.
						</Typography>
					</Box>

					<DesktopSpacer vertical={1} />

					{error !== undefined && (
						<>
							<AlertFullwidth variant="filled" severity="error">
								{error}
							</AlertFullwidth>
							<DesktopSpacer vertical={1} />
						</>
					)}

					{pending === true ? (
						<CircularProgress color="secondary" />
					) : (
						<Button type="submit" variant="contained" color="primary" fullWidth>
							<Typography variant="subtitle1">로그인</Typography>
						</Button>
					)}
				</Box>
			</Container>
		</Box>
	);
};
