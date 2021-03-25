import { useUser } from 'hooks/door/useUser';
import React, { useEffect } from 'react';

export type KeepLoginStateProps = {
	heartbeatInterval?: number;
};

export const KeepLoginState: React.FC<KeepLoginStateProps> = props => {
	const { heartbeatInterval = 5 * 60 * 1000 } = props;
	const {
		user: { authenticated },
		ensureLoginState,
		loginWithSavedCredential,
	} = useUser();

	// ping to server every {interval} milliseconds
	useEffect(() => {
		if (authenticated) {
			const timer = setInterval(ensureLoginState, heartbeatInterval);

			return () => clearInterval(timer);
		}

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authenticated]);

	// detect authenticate state and try to re-authenticate (once)
	// TODO: detect incorrect password and stop trying-login
	useEffect(() => {
		if (!authenticated) loginWithSavedCredential();
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [authenticated]);

	return <></>;
};
