import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { RootState } from 'store';
import { actions } from 'store/modules';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useUser() {
	const user = useSelector((state: RootState) => state.user);
	const dispatch = useDispatch();

	const login = useCallback((...params: Parameters<typeof actions.login>) => dispatch(actions.login(...params)), [dispatch]);
	const loginWithSavedCredential = useCallback(
		(...params: Parameters<typeof actions.loginWithSavedCredential>) => dispatch(actions.loginWithSavedCredential(...params)),
		[dispatch],
	);
	const saveCredential = useCallback(
		(...params: Parameters<typeof actions.saveCredential>) => dispatch(actions.saveCredential(...params)),
		[dispatch],
	);

	const logout = useCallback((...params: Parameters<typeof actions.logout>) => dispatch(actions.logout(...params)), [dispatch]);

	const ensureLoginState = useCallback(() => dispatch(actions.fetchUser()), [dispatch]);

	return {
		user,

		login,
		loginWithSavedCredential,
		saveCredential,
		logout,

		ensureLoginState,
	};
}
