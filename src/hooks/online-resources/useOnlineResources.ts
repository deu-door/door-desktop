import { useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { actions, RootState } from 'store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useOnlineResources() {
	const onlineResources = useSelector((state: RootState) => state.onlineResources);
	const dispatch = useDispatch();

	const fetchExternalLinks = useCallback(() => dispatch(actions.fetchExternalLinks()), [dispatch]);

	return {
		externalLinks: onlineResources.externalLinks,

		fetchExternalLinks,
	};
}
