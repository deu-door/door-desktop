import { DesktopLoginPage } from './pages/DesktopLoginPage';
import React, { useEffect } from 'react';
import { Redirect, Route, Switch } from 'react-router';
import { HashRouter } from 'react-router-dom';
import { DesktopExternalURLPage } from './pages/DesktopExternalLinkPage';
import { DesktopTermPage } from './pages/DesktopTermPage';
import { DesktopLoadingPage } from './pages/DesktopLoadingPage';
import { useUser } from './hooks/door/useUser';
import { useTerm } from './hooks/door/useTerm';
import { useRequestMetadata } from './hooks/request/useRequestMetadata';
import { userLoginURI } from '../common/uri/uri';
import { IS_DEV } from '../common/constants';
import { DesktopNotFoundPage } from './pages/DesktopNotFoundPage';

const DesktopLoginLoadingPage: React.FC = () => {
	const { encryptedCredential, sessionExpired } = useUser();
	const { requestMetadataByURI } = useRequestMetadata();
	const { pending } = requestMetadataByURI(userLoginURI());

	return (
		<DesktopLoadingPage>
			{pending === true ? (
				<>세션 상태를 확인중입니다 ...</>
			) : encryptedCredential !== undefined || sessionExpired !== true ? (
				<Redirect to="/term" />
			) : (
				<Redirect to="/login" />
			)}
		</DesktopLoadingPage>
	);
};

const DesktopTermLoadingPage: React.FC = () => {
	const { termList, fetchTermList } = useTerm();

	useEffect(() => {
		fetchTermList();
	}, []);

	return (
		<DesktopLoadingPage>
			{termList.length > 0 ? <Redirect to={`/term/${termList[0].id}`} /> : <>학기 정보를 가져오는 중입니다 ...</>}
		</DesktopLoadingPage>
	);
};

const Routes: React.FC = () => {
	const { encryptedCredential, sessionExpired } = useUser();

	const contentAvailable = encryptedCredential !== undefined || sessionExpired !== true;

	return (
		<HashRouter>
			<Switch>
				<Route path="/loading" component={DesktopLoginLoadingPage} />
				<Route path="/login" component={DesktopLoginPage} />
				<Route path="/external" component={DesktopExternalURLPage} />

				{contentAvailable && <Route exact path="/term" component={DesktopTermLoadingPage} />}
				{contentAvailable && <Route path="/term/:termId" component={DesktopTermPage} />}

				<Redirect to="/loading" />
			</Switch>
		</HashRouter>
	);
};

export default Routes;
