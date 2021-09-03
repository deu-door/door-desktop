import React, { useState } from 'react';
import { addMinutes } from 'date-fns';
import { useRequestMetadata } from '../../hooks/request/useRequestMetadata';
import { useUser } from '../../hooks/door/useUser';

// to prevent freqeuntly request by this component
const requestRegistry: Record<string, number> = {};

const THROTTLE_MS = 3 * 1000;
const THROTTLE_ON_ERROR_MS = 120 * 1000;

export type DesktopRequestTriggerProps = {
	uri: string;
	expireMinutes?: number;
	onRequest: () => void;
};

export const DesktopRequestTrigger: React.FC<DesktopRequestTriggerProps> = props => {
	const { uri, expireMinutes = 30, onRequest } = props;
	const { sessionExpired } = useUser();

	const [triedOnce, setTriedOnce] = useState(false);

	const { requestMetadataByURI } = useRequestMetadata();
	const { pending, error, fulfilled, fulfilledAt } = requestMetadataByURI(uri);

	const validUntil = addMinutes(fulfilledAt === undefined ? 0 : new Date(fulfilledAt), expireMinutes);

	if (
		// do not trigger when session was expired
		sessionExpired !== true &&
		// prevent frequently ticking request
		(error === undefined || triedOnce) &&
		// do not trigger request while pending
		pending === false &&
		// data has never been fulfilled?
		// ... or data expired? (default: 30 minutes from last fetch)
		(fulfilled === false || validUntil < new Date())
	) {
		// throttle request triggering
		if (Date.now() < (requestRegistry[uri] ?? 0)) {
			console.log(`Throttle request, cancelled. URI=${uri}`);
		} else {
			requestRegistry[uri] = Date.now() + (error === undefined ? THROTTLE_MS : THROTTLE_ON_ERROR_MS);
			onRequest();

			setTriedOnce(true);
		}
	}

	return <></>;
};
