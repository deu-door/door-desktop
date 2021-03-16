import { ITerm } from 'models/door';
import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, RootState } from 'store';
import { selectors } from 'store/modules';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useTerms() {
	const terms = useSelector((state: RootState) => state.terms);
	const dispatch = useDispatch();

	const allTerms = () => selectors.termsSelector.selectAll(terms);
	const termById = (id: ITerm['id']) => selectors.termsSelector.selectById(terms, id);

	const fetchTerms = useCallback(() => dispatch(actions.fetchTerms()), [dispatch]);

	return {
		terms,

		allTerms,
		termById,

		fetchTerms,
	};
}
