import { AnyAction } from '@reduxjs/toolkit';
import { Middleware } from 'redux';
import { mainActions } from '../modules';
import { RequestAction } from './request.interface';

const hasURI = (action: AnyAction): action is RequestAction => {
	if (typeof action?.meta === 'object' && typeof action.meta !== null && typeof action.meta?.uri === 'string') {
		return true;
	}
	return false;
};

const isObject = (obj: unknown): obj is Record<string, unknown> => {
	return typeof obj === 'object' && obj !== null;
};

const getErrorMessage = (payload: unknown) => {
	if (payload instanceof Error) {
		return payload.message;
	}
	if (isObject(payload)) {
		return typeof payload?.message === 'string'
			? payload.message
			: typeof payload?.name === 'string'
			? payload.name
			: JSON.stringify(payload);
	}
	if (typeof payload === 'string') {
		return payload;
	}
	return undefined;
};

/**
 * AsyncThunk 액션을 middleware 레벨에서 inject하여 RequestMetadata를 작성해줌
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export const requestMetadataMiddleware: Middleware = store => next => (action: AnyAction) => {
	if (hasURI(action)) {
		const uri = action.meta.uri;

		if (action.type.endsWith('/pending')) {
			store.dispatch(mainActions.updateRequestMetadataPending(uri));
		} else if (action.type.endsWith('/fulfilled')) {
			store.dispatch(mainActions.updateRequestMetadataFulfilled(uri));
		} else if (action.type.endsWith('/rejected')) {
			store.dispatch(mainActions.updateRequestMetadataRejected(uri, getErrorMessage(action?.payload)));
		}
	}

	next(action);
};
