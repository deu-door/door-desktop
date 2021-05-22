import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { Provider } from 'react-redux';
import axios from 'axios';
import door from 'services/door';
import { PersistGate } from 'redux-persist/integration/react';
import { store, persistor } from 'store';
import { downloader } from 'services/downloader';
import { driver } from 'services/door/util';
import { Titlebar, Color } from 'custom-electron-titlebar';

axios.interceptors.request.use(request => {
	console.log('[Axios] Starting Request', request);
	return request;
});

axios.interceptors.response.use(response => {
	console.log('[Axios] Receive Response', response);
	return response;
});

Object.assign(window, {
	// Debug door APIs (i.e. getCourses(), getNotices(), ...)
	door,
	// Debug current redux state (store.getState())
	store,
	// Debug downloader
	downloader,
	// Debug with axios driver
	driver,
});

ReactDOM.render(
	<React.StrictMode>
		<Provider store={store}>
			<PersistGate loading={null} persistor={persistor}>
				<App />
			</PersistGate>
		</Provider>
	</React.StrictMode>,
	document.getElementById('root'),
);

const titlebar = new Titlebar({
	backgroundColor: Color.fromHex('#204fa3'),
	menu: undefined,
	titleHorizontalAlignment: 'center',
	unfocusEffect: false,
});

document.title = '';
titlebar.updateTitle();

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
