import { createTransform } from 'redux-persist';
import { reducers } from '../modules';

export const PersistCredential = createTransform<unknown, unknown, ReturnType<typeof reducers.user>>(
	// transform state on its way to being serialized and persisted.
	(inboundState, key, fullState) => {
		if (key === 'encryptedCredential') {
			// determine to persist credential
			return fullState.persistCredential === true ? inboundState : undefined;
		}
		return inboundState;
	},
	null,
);
