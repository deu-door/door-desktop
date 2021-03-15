import Keytar from 'keytar';
import crypto from 'crypto';

const SERVICE_NAME = 'Door Desktop';
const KEY_SECRET = 'secret';

const ALGORITHM = 'aes-256-cbc';
const keytar: typeof Keytar = window.require('electron').remote.require('keytar');

// decrypt by encrypted credential
async function decryptCredential(encrypted: string): Promise<{ id: string; password: string } | undefined> {
	const hash = JSON.parse((await keytar.getPassword(SERVICE_NAME, KEY_SECRET)) ?? '{}');

	if (!('iv' in hash && 'secret' in hash)) return undefined;

	const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(hash.secret, 'base64'), Buffer.from(hash.iv, 'base64'));

	const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]);

	return JSON.parse(decrypted.toString());
}

// returns encrypted credential
async function encryptCredential(credential: { id: string; password: string }): Promise<string> {
	const serialized = JSON.stringify(credential);

	const secret = crypto.randomBytes(32);
	const iv = crypto.randomBytes(16);

	// store secret and iv to OS keychain
	await keytar.setPassword(
		SERVICE_NAME,
		KEY_SECRET,
		JSON.stringify({
			secret: secret.toString('base64'),
			iv: iv.toString('base64'),
		}),
	);

	const cipher = crypto.createCipheriv(ALGORITHM, Buffer.from(secret), iv);

	const encrypted = Buffer.concat([cipher.update(serialized), cipher.final()]);

	return encrypted.toString('base64');
}

export const secure = {
	decryptCredential,
	encryptCredential,
};
