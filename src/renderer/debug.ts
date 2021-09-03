import { store } from './store';
import { actions } from '../common/modules';

// DEBUG WITH BROWSER CONSOLE
Object.assign(window, {
	store, // redux store
	actions, // redux actions (fire action manually)
});
