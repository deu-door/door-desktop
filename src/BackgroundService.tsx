import React, { useEffect } from 'react';
import { service } from 'store/background';

export const BackgroundService: React.FC = () => {
	useEffect(() => {
		service.start();

		return () => service.stop();
	});

	return (
		<div></div>
	);
}