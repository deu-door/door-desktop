import { createMigrate, createTransform, PersistMigrate } from 'redux-persist';

export interface IAsyncThunkState {
	pending: boolean;
	error: string | undefined;
	// serialized date. => timestamp
	fulfilledAt?: string;
}

export const toPending = <State extends Partial<IAsyncThunkState>>(state: State): State => {
	state.pending = true;
	state.error = undefined;

	return state;
};

export const toFulfilled = <State extends Partial<IAsyncThunkState>>(state: State): State => {
	state.pending = false;
	state.error = undefined;
	state.fulfilledAt = new Date().toISOString();

	return state;
};

export const toRejectedWithError = <State extends Partial<IAsyncThunkState>>(state: State, error: string | undefined): State => {
	state.pending = false;
	state.error = error;

	return state;
};

function isObject(state: unknown): state is Record<string, unknown> {
	return state !== null && typeof state === 'object';
}

function isArray(state: unknown): state is unknown[] {
	return Array.isArray(state);
}

const transformNestedAsyncThunk = (state: Record<string, unknown>) => {
	for (const key in state) {
		if (key === 'pending') {
			state[key] = false;
			continue;
		}

		const value = state[key];

		if (isObject(value)) {
			state[key] = transformNestedAsyncThunk(value);
		}

		if (isArray(value)) {
			state[key] = value.map(d => (isObject(d) ? transformNestedAsyncThunk(d) : d));
		}
	}

	return state;
};

export const AsyncThunkTransform = createTransform(
	// transform state on its way to being serialized and persisted.
	(inboundState, key) => {
		return inboundState;
	},
	// transform state being rehydrated
	(outboundState, key) => {
		return transformNestedAsyncThunk({ [key]: outboundState })[key as string];
	},
);

export const ResetOnVersionChange: PersistMigrate = createMigrate(
	// No migration yet. Data will be reseted when version change.
	// reserved for 0 to 100 versions.
	Object.fromEntries(new Array(100).fill(0).map((_, version) => [version, state => undefined])),
	{ debug: true },
);
