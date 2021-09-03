import { AnyAction, AsyncThunk, createAction, createSlice, isAnyOf, isFulfilled, isRejected, PayloadAction } from '@reduxjs/toolkit';
import door from '../door';
import { SavedCredentialError } from '../error/error.interfaces';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { userLoginURI, userLogoutURI, userURI } from '../uri/uri';
import { Door, User } from 'door-api';

export interface UserState {
	sessionExpired: boolean;
	encryptedCredential?: string;
	user?: User;
	persistCredential: boolean;
}

const initialState: UserState = {
	sessionExpired: true,
	persistCredential: false,
};

const saveCredential = createDoorAsyncThunk<string, [{ id: string; password: string }]>({
	typePrefix: 'User/SaveCredential',
	thunk: () => async credential => {
		// ONLY main process
		const { default: secure } = await import('../../main/helper/secure');

		return secure.encryptCredential(credential);
	},
});

const login = createDoorAsyncThunk<User, Parameters<Door['login']>>({
	typePrefix: 'User/Login',
	getMeta: () => ({ uri: userLoginURI() }),
	thunk:
		({ dispatch }) =>
		async (id, password) => {
			const user = await door.login(id, password);

			// login success! save user's credential into keychain store
			dispatch(saveCredential({ id, password }));

			return user;
		},
});

const loginWithEncryptedCredential = createDoorAsyncThunk<User, [encryptedCredential: string | undefined]>({
	typePrefix: 'User/LoginWithEncryptedCredential',
	thunk:
		({ dispatch }) =>
		async encryptedCredential => {
			// ONLY main process
			const { default: secure } = await import('../../main/helper/secure');

			if (encryptedCredential === undefined) throw new SavedCredentialError('Saved credential not found.');

			const decrypted = await secure.decryptCredential(encryptedCredential);
			if (decrypted === undefined) throw new SavedCredentialError('Decrypt failed');

			const { id, password } = decrypted;
			return await door.login(id, password);
		},
});

const fetchUser = createDoorAsyncThunk<User>({
	typePrefix: 'User/Fetch',
	getMeta: () => ({ uri: userURI() }),
	thunk: () => () => door.getUser(),
});

const logout = createDoorAsyncThunk({
	typePrefix: 'User/Logout',
	getMeta: () => ({ uri: userLogoutURI() }),
	thunk:
		({ dispatch }) =>
		async () => {
			try {
				await door.logout();
			} catch (e) {}

			dispatch(reset());
		},
});

// reset all state when user logout
export const reset = createAction('User/Reset');

// eslint-disable-next-line @typescript-eslint/no-explicit-any
const isRejectedAction = (action: AnyAction): action is ReturnType<AsyncThunk<unknown, unknown, any>['rejected']> => {
	return action.type.endsWith('/rejected');
};

const slice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setPersistCredential: (state, action: PayloadAction<boolean>) => {
			state.persistCredential = action.payload;
		},
	},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(saveCredential.fulfilled, (state, { payload: encryptedCredential }) => {
				state.encryptedCredential = encryptedCredential;
			})
			.addCase(saveCredential.rejected, state => {
				state.encryptedCredential = undefined;
				state.persistCredential = false;
			})
			// manually logout, delete all data
			.addMatcher(isAnyOf(logout.fulfilled, logout.rejected), (state: UserState) => {
				state.sessionExpired = true;
				state.encryptedCredential = undefined;
				state.persistCredential = false;
			})
			.addMatcher(isFulfilled(login, loginWithEncryptedCredential, fetchUser), (state, { payload: user }) => {
				state.sessionExpired = false;
				state.user = user;
			})
			.addMatcher(isRejected(login, loginWithEncryptedCredential, fetchUser), (state, { payload: error }) => {
				// incorrect password? or invalid credential?
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if ((error as any)?.name === 'DoorLoginError' || (error as any)?.name === 'SavedCredentialError') {
					// remove invalid credential
					state.encryptedCredential = undefined;
					state.persistCredential = false;
				}

				// cannot ensure login state
				state.sessionExpired = true;
			})
			.addMatcher(isRejectedAction, (state, { payload: error }) => {
				// detect unauthorized state from other actions
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				if ((error as any)?.name === 'DoorUnauthorizedError' || (error as any)?.name === 'DoorUnavailableError') {
					console.log('Unauthorized state detected', error);
					state.sessionExpired = true;
				}
			}),
});

const user = {
	reducer: slice.reducer,
	actions: {
		...slice.actions,

		login,
		loginWithEncryptedCredential,
		saveCredential,
		logout,
		fetchUser,
		reset,
	},
};

export default user;
