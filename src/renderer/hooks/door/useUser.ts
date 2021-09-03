import { actions } from '../../../common/modules';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useUser() {
	const user = useSelector(state => state.user.user);
	const sessionExpired = useSelector(state => state.user.sessionExpired);
	const encryptedCredential = useSelector(state => state.user.encryptedCredential);
	const persistCredential = useSelector(state => state.user.persistCredential);

	const dispatch = useDispatch();

	const setPersistCredential = useCallback(
		(...params: Parameters<typeof actions.setPersistCredential>) => dispatch(actions.setPersistCredential(...params)),
		[dispatch],
	);
	const login = useCallback((...params: Parameters<typeof actions.login>) => dispatch(actions.login(...params)), [dispatch]);
	const saveCredential = useCallback(
		(...params: Parameters<typeof actions.saveCredential>) => dispatch(actions.saveCredential(...params)),
		[dispatch],
	);
	const logout = useCallback((...params: Parameters<typeof actions.logout>) => dispatch(actions.logout(...params)), [dispatch]);
	const ensureLoginState = useCallback(() => dispatch(actions.fetchUser()), [dispatch]);

	return {
		user,
		sessionExpired,
		encryptedCredential,
		persistCredential,

		setPersistCredential,
		login,
		saveCredential,
		logout,
		ensureLoginState,
	};
}
