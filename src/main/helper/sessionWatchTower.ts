import { mainActions } from '../../common/modules';
import { Door, User } from 'door-api';
import { RootState, store } from '../store';
import log from 'electron-log';
import { runEvery } from '../../common/helper/schedule';
import { ThunkDispatch } from 'redux-thunk';
import { AnyAction } from 'redux';

// thunk-action type-safe dispatch
// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export const dispatch = (action: unknown) => (store.dispatch as ThunkDispatch<RootState, void, AnyAction>)(action as AnyAction);

const WATCH_INTERVAL = 5 * 60 * 1000; // 5 minutes

/**
 * 세션 로그인 상태를 감시하는 클래스. 세션 만료 감지 시 저장된 ID, Password로 로그인을 시도한다.
 */
export class SessionWatchTower {
	handler: number;
	door: Door;

	constructor(door: Door) {
		this.door = door;
		this.handler = runEvery(() => {
			this.ensureSession();
		}, WATCH_INTERVAL);

		this.subscribeSessionState();
	}

	ensureSession(): void {
		dispatch(mainActions.fetchUser());
	}

	/**
	 * 저장되어있는 ID, Password로 로그인을 시도합니다.
	 *
	 * @returns 자동 로그인 성공 시 {@link User}, 실패 시 `undefined` 반환
	 */
	async tryLoginWithSavedCredential(): Promise<User | undefined> {
		log.info('Try to login with saved credential ...');
		const encryptedCredential = store.getState().user.encryptedCredential;
		if (encryptedCredential === undefined) {
			log.info('Saved encrypted credential not found! (please login manually)');
			return undefined;
		}

		await dispatch(mainActions.loginWithEncryptedCredential(encryptedCredential));
		return store.getState().user.user;
	}

	onSessionExpired(): void {
		log.info('Session expired, try to login ...');

		this.tryLoginWithSavedCredential();
	}

	subscribeSessionState(): void {
		let currentValue: boolean | undefined = undefined;
		store.subscribe(() => {
			const previousValue = currentValue;
			currentValue = store.getState().user.sessionExpired;

			if (previousValue !== undefined && previousValue !== currentValue) {
				// session expired?
				if (currentValue === true) {
					this.onSessionExpired();
				}
			}
		});
	}
}
