import React from 'react';
import { useLocation, RouteComponentProps } from 'react-router';
import { DesktopNotFoundPage } from './DesktopNotFoundPage';

export type DesktopExternalURLPageProps = RouteComponentProps;

export const DesktopExternalURLPage: React.FC<DesktopExternalURLPageProps> = props => {
	const query = new URLSearchParams(useLocation().search);

	const link = decodeURIComponent(query.get('link') || '');

	if (link.length === 0) return <DesktopNotFoundPage>link가 비어있습니다.</DesktopNotFoundPage>;

	return <webview title={link} src={link} allowFullScreen style={{ width: '100%', height: '100%' }} />;
};
