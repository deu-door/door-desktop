import { Box, Typography } from '@material-ui/core';
import { useUser } from 'hooks/door/useUser';
import React, { useEffect, useState } from 'react';
import { Redirect } from 'react-router-dom';
import { default as LogoOriginalWhite } from 'resources/logo-original-white.svg';

/**
 * @description renders splash page and try to login with saved credential. if failed, redirect to login page
 */
export const SplashPage: React.FC = () => {
	const {
		user: { authenticated },
		loginWithSavedCredential,
	} = useUser();
	const [autoLoginTried, setAutoLoginTried] = useState(false);
	const [redirectTo, setRedirectTo] = useState<string | undefined>(undefined);

	useEffect(() => {
		const tryLoginWithSavedIdPassword = async () => {
			if (authenticated) return setAutoLoginTried(true);

			await loginWithSavedCredential();

			setAutoLoginTried(true);
		};

		tryLoginWithSavedIdPassword();
	}, []);

	useEffect(() => {
		if (autoLoginTried) {
			if (authenticated) {
				setRedirectTo('/courses');
			} else {
				setRedirectTo('/login');
			}
		}
	}, [autoLoginTried, authenticated]);

	return (
		<Box
			flex="1"
			display="flex"
			flexDirection="column"
			alignItems="center"
			justifyContent="center"
			bgcolor="primary.main"
			color="primary.contrastText"
		>
			<img width="128" alt="logo-original-white" src={LogoOriginalWhite} />

			<Box height="1.4rem" />

			<Typography variant="h5">Starting Door Desktop ...</Typography>

			{redirectTo !== undefined && <Redirect to={redirectTo} />}
		</Box>
	);
};
