import { createAsyncThunk, createSlice, isAnyOf, isFulfilled, isPending, isRejected } from '@reduxjs/toolkit';
import { IUser } from 'models/door';
import { createTransform, persistReducer } from 'redux-persist';
import door from 'services/door';
import { HttpError } from 'services/response';
import { secure } from 'services/secure';
import { persistedStorage } from 'store/modules/persisted-storage';
import { AsyncThunkTransform, IAsyncThunkState, ResetOnVersionChange, toFulfilled, toPending, toRejectedWithError } from './util';

export interface UserState extends IAsyncThunkState {
	authenticated: boolean;
	encryptedCredential?: string;
	user?: IUser;
}

const initialState: UserState = {
	pending: false,
	error: undefined,
	authenticated: false,
};

const login = createAsyncThunk<IUser, { id: string; password: string }, { rejectValue: HttpError }>(
	'user/login',
	async ({ id, password }, { rejectWithValue }) => {
		try {
			const response = await door.login(id, password);

			return response.data;
		} catch (e) {
			const error: HttpError = e;

			return rejectWithValue(error);
		}
	},
);

const saveCredential = createAsyncThunk<string, { id: string; password: string }>(
	'user/saveCredential',
	async (credential, { rejectWithValue }) => secure.encryptCredential(credential),
);

const loginWithSavedCredential = createAsyncThunk<IUser, void, { state: { user: UserState }; rejectvalue: Error }>(
	'user/loginWithSavedCredential',
	async (_, { rejectWithValue, getState }) => {
		try {
			const encryptedCredential = getState().user.encryptedCredential;

			console.log(encryptedCredential);

			if (encryptedCredential === undefined) throw new Error('Saved credential not found.');

			const decrypted = await secure.decryptCredential(encryptedCredential);

			console.log(decrypted);

			if (decrypted === undefined) throw new Error('Decrypt failed');

			const { id, password } = decrypted;

			const response = await door.login(id, password);

			return response.data;
		} catch (e) {
			const error: Error = e;

			console.log(error?.message);

			return rejectWithValue(error);
		}
	},
);

const fetchUser = createAsyncThunk<IUser, void, { rejectValue: HttpError }>('user/getUser', async (_, { rejectWithValue }) => {
	try {
		const response = await door.getUser();

		return response.data;
	} catch (e) {
		const error: HttpError = e;
		return rejectWithValue(error);
	}
});

const logout = createAsyncThunk('user/logout', async () => {
	await door.logout();
});

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		deleteSavedCredential: state => {
			state.encryptedCredential = undefined;
		},
	},
	extraReducers: builder =>
		builder
			.addCase(saveCredential.fulfilled, (state, { payload: encryptedCredential }) => {
				state.encryptedCredential = encryptedCredential;
			})
			.addCase(saveCredential.rejected, state => {
				state.encryptedCredential = undefined;
			})
			.addCase(loginWithSavedCredential.rejected, state => {
				// auto login failed, password may changed
				state.encryptedCredential = undefined;
			})
			.addCase(logout.pending, toPending)
			// manually logout, delete all data
			.addMatcher(isAnyOf(logout.fulfilled, logout.rejected), (state: UserState) => {
				state.authenticated = false;
				state.encryptedCredential = undefined;
				state.pending = false;
				state.error = undefined;
				state.fulfilledAt = undefined;
			})
			.addMatcher(isPending(login, fetchUser), toPending)
			.addMatcher(isFulfilled(login, loginWithSavedCredential, fetchUser), (state, { payload: user }) => {
				toFulfilled(state);
				state.authenticated = true;
				state.user = user;
			})
			.addMatcher(isRejected(login, fetchUser), (state, { payload: error }) => {
				toRejectedWithError(state, error?.message);

				// cannot ensure login state
				state.authenticated = false;
			}),
});

const AuthenticatedTransform = createTransform(
	(inboundState, key) => {
		if (key === 'authenticated') return false;
		if (key === 'error') return undefined;

		return inboundState;
	},
	(outboundState, key) => {
		if (key === 'authenticated') return false;
		if (key === 'error') return undefined;

		return outboundState;
	},
);

export const reducer = persistReducer(
	{
		key: 'user',
		storage: persistedStorage,
		transforms: [AsyncThunkTransform, AuthenticatedTransform],
		version: 2,
		migrate: ResetOnVersionChange,
	},
	userSlice.reducer,
) as typeof userSlice.reducer;

export const actions = {
	...userSlice.actions,

	login,
	loginWithSavedCredential,
	saveCredential,
	logout,
	fetchUser,
};
