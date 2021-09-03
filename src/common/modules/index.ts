import { AliasedAction, createAliasedAction } from 'electron-redux';
import assignment from './assignment';
import batchAction from './batchAction';
import course from './course';
import download from './download';
import lecture from './lecture';
import post from './post';
import requestMetadata from './requestMetadata';
import term from './term';
import user from './user';

export const reducers = {
	user: user.reducer,
	term: term.reducer,
	course: course.reducer,
	post: post.reducer,
	assignment: assignment.reducer,
	lecture: lecture.reducer,
	requestMetadata: requestMetadata.reducer,
	download: download.reducer,
	batchAction: batchAction.reducer,
} as const;

export const mainActions = {
	...user.actions,
	...term.actions,
	...course.actions,
	...post.actions,
	...assignment.actions,
	...lecture.actions,
	...requestMetadata.actions,
	...download.actions,
	...batchAction.actions,
} as const;

export const selectors = {
	...term.selectors,
	...course.selectors,
	...post.selectors,
	...assignment.selectors,
	...lecture.selectors,
	...requestMetadata.selectors,
	...download.selectors,
	...batchAction.selectors,
} as const;

/**
 * Register aliased actions (both main and renderer process)
 */
export const actions = Object.fromEntries(
	Object.entries(mainActions).map(([name, action]) => [
		name,
		createAliasedAction<string, Parameters<typeof action>>(
			name,
			// mute typescript error
			(...params: Parameters<typeof action>) => {
				// eslint-disable-next-line @typescript-eslint/no-explicit-any
				return (action as any)(...params) as any;
			},
		),
	]),
) as unknown as {
	[K in keyof typeof mainActions]: (...params: Parameters<typeof mainActions[K]>) => AliasedAction<K, Parameters<typeof mainActions[K]>>;
};
