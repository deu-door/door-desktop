import { createLogger } from 'redux-logger';

/**
 * Create redux logger for both main and renderer process for share options
 *
 * @param options Additional redux-logger option
 * @returns redux-logger instance
 */
export const createDefaultReduxLogger = (...options: Parameters<typeof createLogger>): ReturnType<typeof createLogger> => {
	return createLogger({
		// show diff between prev and next
		diff: true,
		// default collapsed when displayed on console
		collapsed: () => true,
		// blacklist action to log
		predicate: (getState, action) => {
			return !action?.type?.startsWith('UpdateRequestMetadata') && action?.type !== 'ALIASED';
		},
		...options,
	});
};
