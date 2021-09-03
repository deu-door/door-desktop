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
			) : sessionExpired === false ? (
				<Redirect to="/term" />
			) : encryptedCredential === undefined ? (
				<Redirect to="/login" />
			) : (
				<></>
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
	const { encryptedCredential } = useUser();

	return (
		<HashRouter>
			<Switch>
				<Route path="/loading" component={DesktopLoginLoadingPage} />
				<Route path="/login" component={DesktopLoginPage} />
				<Route path="/external" component={DesktopExternalURLPage} />

				{/* Following routes are login required */}
				{encryptedCredential !== undefined && <Route exact path="/term" component={DesktopTermLoadingPage} />}
				{encryptedCredential !== undefined && <Route path="/term/:termId" component={DesktopTermPage} />}

				<Route exact path="/" component={() => <Redirect to="/loading" />} />

				{/* In production, fallback to /loading */}
				{!IS_DEV && <Redirect to="/loading" />}

				<Route path="*" component={DesktopNotFoundPage} />
			</Switch>
		</HashRouter>
	);
};

export default Routes;
