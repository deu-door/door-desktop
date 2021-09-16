import { createTransform } from 'redux-persist';
import { reducers } from '../../common/modules';
import { RequestMetadata } from '../../common/request/request.interface';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const RequestMetadataResetPending = createTransform<unknown, unknown, any, ReturnType<typeof reducers.requestMetadata>>(
	// transform state on its way to being serialized and persisted.
	//(inboundState, key) => inboundState,
	null,
	// transform state being rehydrated
	(outboundState, key) => {
		if (key === 'entities') {
			return Object.fromEntries(
				Object.entries(outboundState as ReturnType<typeof reducers.requestMetadata>['entities'])
					.filter((entity): entity is [string, RequestMetadata] => entity[1] !== undefined)
					.map(([uri, requestMetadata]) => [
						uri,
						{
							...requestMetadata,
							pending: false,
						},
					]),
			);
		}
		return outboundState;
	},
);
