import { selectors } from '../../../common/modules';
import { useSelector } from '../../store';
import { BatchActionProgress } from '../../../common/batchAction/batchAction.interfaces';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useBatchAction() {
	const state = useSelector(state => state.batchAction);

	const batchActionProgressList = selectors.batchAction.selectAll(state);
	const batchActionProgressById = (id: BatchActionProgress['id']) => selectors.batchAction.selectById(state, id);

	return {
		batchActionProgressList,
		batchActionProgressById,
	};
}
