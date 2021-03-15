import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, RootState } from 'store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useTerms() {
	const terms = useSelector((state: RootState) => state.terms);
	const dispatch = useDispatch();

	const fetchTerms = useCallback(() => dispatch(actions.fetchTerms()), [dispatch]);

	return {
		terms,

		fetchTerms,
	};
}
