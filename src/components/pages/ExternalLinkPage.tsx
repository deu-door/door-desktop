import React from 'react';
import { useLocation } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';

export type ExternalLinkPageProps = RouteComponentProps;

export const ExternalLinkPage: React.FC<ExternalLinkPageProps> = props => {
	const query = new URLSearchParams(useLocation().search);

	const link = decodeURIComponent(query.get('link') || '');

	if (link.length === 0) return <div>404 NOT FOUND for link {link}</div>;

	return <webview title={link} src={link} allowFullScreen style={{ width: '100%', height: '100%' }} />;
};
