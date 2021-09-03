import { AnyAction } from 'redux';
import { writeMeta } from '../helper/writeMeta';
import { actions } from '../modules';

export type BatchActionElement = {
	action: AnyAction;
	message: string;
};

/**
 * action들을 하나의 batch action으로 만들어주는 함수. action은 serialize가 가능해야 한다.
 *
 * thunk-action은 사용 불가하다.
 *
 * @param id batch action의 진행 상태를 식별하기 위한 id 값
 * @param batch 묶을 action들
 * @returns aliased batch action
 */
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function createBatchAction(id: string, batch: BatchActionElement[]) {
	const batchActions = batch.map(({ action, message }) => writeMeta(action, { message }));

	return actions.doBatchAction(id, batchActions);
}
