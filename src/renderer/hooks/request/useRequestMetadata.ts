import { RequestMetadata } from '../../../common/request/request.interface';
import { selectors } from '../../../common/modules';
import { useSelector } from '../../store';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useRequestMetadata() {
	const state = useSelector(state => state.requestMetadata);

	const requestMetadataByURI = (uri: string) =>
		Object.assign(
			{
				uri,
				pending: false,
				fulfilledAt: undefined,
				error: undefined,
				fulfilled: false,
			} as RequestMetadata,
			selectors.requestMetadata.selectById(state, uri),
		);

	return {
		requestMetadataByURI,
	};
}
