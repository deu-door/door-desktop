import door from '../common/door';
import { actions } from '../common/modules';
import { store } from './store';

// @ts-ignore
import aliasRegistry from 'electron-redux/dist/registry/alias';

door.verbose();

Object.assign(global, {
	door,
	store,
	actions,
	aliasRegistry,
});
