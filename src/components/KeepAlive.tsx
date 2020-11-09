import React, { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { actions } from 'store/modules';

export const KeepAlive: React.FC<{ heartbeatInterval?: number }> = props => {
	const { heartbeatInterval = 5 * 60 * 1000 } = props;
	const dispatch = useDispatch();

	useEffect(() => {
		const timer = setInterval(() => {
			dispatch(actions.ping().fetch());
		}, heartbeatInterval);

		return () => clearInterval(timer);
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<></>
	);
}