import { actions, selectors } from '../../../common/modules';
import { Term } from 'door-api';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useTerm() {
	const state = useSelector(state => state.term);

	const dispatch = useDispatch();

	const termList = selectors.term.selectAll(state);

	const termById = (id: Term['id']) => selectors.term.selectById(state, id);
	const fetchTermList = useCallback(() => dispatch(actions.fetchTermList()), [dispatch]);

	return {
		termList,

		termById,
		fetchTermList,
	};
}
