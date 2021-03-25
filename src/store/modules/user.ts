import {
	AnyAction,
	AsyncThunk,
	createAction,
	createAsyncThunk,
	createSlice,
	isAnyOf,
	isFulfilled,
	isPending,
	isRejected,
	PayloadAction,
} from '@reduxjs/toolkit';
import { IUser } from 'models/door';
import { createTransform, persistReducer } from 'redux-persist';
import door from 'services/door';
import { HttpError, NotAcceptableError, UnauthorizedError } from 'services/response';
import { secure } from 'services/secure';
import { persistedStorage } from 'store/modules/persisted-storage';
import { environment } from './environment';
import {
	AsyncThunkTransform,
	IAsyncThunkState,
	ResetOnVersionChange,
	toFulfilled,
	toPending,
	toRejectedWithError,
	UserDataTransform,
} from './util';

export interface UserState extends IAsyncThunkState {
	authenticated: boolean;
	encryptedCredential?: string;
	user?: IUser;
	persistAuthorization: boolean;
}

const initialState: UserState = {
	pending: false,
	error: undefined,
	fulfilledAt: undefined,
	authenticated: false,
	persistAuthorization: false,
};

const saveCredential = createAsyncThunk<string, { id: string; password: string }>(
	'user/saveCredential',
	async (credential, { rejectWithValue }) => secure.encryptCredential(credential),
);

const login = createAsyncThunk<IUser, { id: string; password: string }, { rejectValue: HttpError }>(
	'user/login',
	async ({ id, password }, { rejectWithValue, dispatch }) => {
		try {
			const response = await door.login(id, password);

			dispatch(saveCredential({ id, password }));

			return response.data;
		} catch (e) {
			const error: HttpError = e;

			return rejectWithValue(error);
		}
	},
);

const loginWithSavedCredential = createAsyncThunk<void, void, { state: { user: UserState }; rejectvalue: Error }>(
	'user/loginWithSavedCredential',
	async (_, { rejectWithValue, getState, dispatch }) => {
		try {
			const encryptedCredential = getState().user.encryptedCredential;

			if (encryptedCredential === undefined) throw new Error('Saved credential not found.');

			const decrypted = await secure.decryptCredential(encryptedCredential);

			if (decrypted === undefined) throw new Error('Decrypt failed');

			const { id, password } = decrypted;

			await dispatch(login({ id, password }));
		} catch (e) {
			const error: Error = e;

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

// reset all data by logout
export const reset = createAction('user/reset');

const logout = createAsyncThunk('user/logout', async (_, { dispatch }) => {
	try {
		await door.logout();
		// suppress error
	} catch (e) {}

	// request reset all data (...to other slices)
	dispatch(reset());
});

const isRejectedAction = (action: AnyAction): action is ReturnType<AsyncThunk<unknown, unknown, any>['rejected']> => {
	return action.type.endsWith('/rejected');
};

const userSlice = createSlice({
	name: 'user',
	initialState,
	reducers: {
		setPersistAuthorization: (state, action: PayloadAction<boolean>) => {
			state.persistAuthorization = action.payload;
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
				// saved credential may corrupted
				state.encryptedCredential = undefined;
			})
			.addCase(logout.pending, toPending)
			// manually logout, delete all data
			.addMatcher(isAnyOf(logout.fulfilled, logout.rejected), (state: UserState) => {
				state.authenticated = false;
				state.encryptedCredential = undefined;
				state.persistAuthorization = false;

				state.pending = false;
				state.error = undefined;
				state.fulfilledAt = undefined;
			})
			.addMatcher(isPending(login, fetchUser), toPending)
			.addMatcher(isFulfilled(login, fetchUser), (state, { payload: user }) => {
				toFulfilled(state);
				state.authenticated = true;
				state.user = user;

				// determine persist user data
				environment.persistUserData = state.persistAuthorization;
			})
			.addMatcher(isRejected(login, fetchUser), (state, { payload: error }) => {
				// incorrect password?
				if (error instanceof NotAcceptableError) {
					// remove incorrect credential
					state.encryptedCredential = undefined;
				}

				toRejectedWithError(state, error?.message);

				// cannot ensure login state
				state.authenticated = false;
			})
			.addMatcher(isRejectedAction, (state, { payload: error }) => {
				// detect unauthorized state from other actions
				if (error instanceof UnauthorizedError) {
					state.authenticated = false;
				}
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
		transforms: [UserDataTransform, AsyncThunkTransform, AuthenticatedTransform],
		version: 3,
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
	reset,
};
