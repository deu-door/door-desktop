import { AnyAction } from 'redux';

/**
 * action에 meta를 작성하기 위한 함수
 */
export function writeMeta<Action extends AnyAction>(action: Action, meta: Record<string, unknown>): Action {
	if (!('meta' in action)) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		(action as any).meta = {};
	}
	if (typeof action?.meta === 'object' && action.meta !== null) {
		Object.assign(action.meta, meta);
	}
	return action;
}
