import { KeepLoginState } from 'components/common/KeepLoginState';
import { CoursePage } from 'components/pages/CoursePage';
import { LoginPage } from 'components/pages/LoginPage';
import { SplashPage } from 'components/pages/SplashPage';
import React from 'react';
import { useEffect } from 'react';
import { Route, useLocation, Switch } from 'react-router';
import { HashRouter, Redirect, RouteComponentProps } from 'react-router-dom';
import { Downloads } from 'components/common/Downloads';
import { ExternalLinkPage } from 'components/pages/ExternalLinkPage';
import { useUser } from 'hooks/door/useUser';

export const ScrollToTopOnMount: React.FC = props => {
	const { pathname } = useLocation();

	useEffect(() => {
		window.scrollTo(0, 0);
	}, [pathname]);

	return null;
};

export const HomeRoutes: React.FC<RouteComponentProps> = ({ match }) => {
	const {
		user: { authenticated },
	} = useUser();

	return (
		<Switch>
			<Route exact path="/splash" component={SplashPage} />
			<Route exact path="/login" component={LoginPage} />

			<Redirect to={authenticated ? '/courses' : '/splash'} />
		</Switch>
	);
};

export const CourseRoutes: React.FC<RouteComponentProps> = ({ match }) => {
	return (
		<>
			<Downloads />
			<KeepLoginState />
			<Switch>
				<Route exact path={match.url} component={CoursePage} />
				<Route path={`${match.url}/:courseId`} component={CoursePage} />
			</Switch>
		</>
	);
};

export const Routes: React.FC = () => {
	return (
		<HashRouter>
			<Switch>
				<Route path="/courses" component={CourseRoutes} />
				<Route path="/external" component={ExternalLinkPage} />
				<Route path="/" component={HomeRoutes} />
			</Switch>
		</HashRouter>
	);
};
