import React, { useEffect } from 'react';
import { backgroundFetchIterator } from 'store/background';

export const BackgroundService: React.FC = () => {
	useEffect(() => {
		// backgroundFetchIterator.start();

		// return () => backgroundFetchIterator.stop();
	}, []);

	return (
		<div></div>
	);
}