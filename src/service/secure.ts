import Keytar from 'keytar';

const SERVICE_NAME = 'Door Desktop';

const keytar: typeof Keytar = window.require('electron').remote.require('keytar');

export async function getSecurelyStoredPassword(id: string): Promise<string|null> {
	return keytar.getPassword(SERVICE_NAME, id);
}

async function savePasswordSecurely(id: string, password: string): Promise<void> {
	return keytar.setPassword(SERVICE_NAME, id, password);
}

async function removeSecurelyStoredPassword(id: string): Promise<boolean> {
	return keytar.deletePassword(SERVICE_NAME, id);
}

export const secure = {
	/**
	 * @description Get securely stored password by given id
	 */
	get: getSecurelyStoredPassword,
	/**
	 * @description Save password into OS password manager, using keytar
	 */
	save: savePasswordSecurely,
	/**
	 * @description Remove saved password
	 */
	remove: removeSecurelyStoredPassword
};