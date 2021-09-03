import keytar from 'keytar';
import crypto from 'crypto';

const SERVICE_NAME = 'Door Desktop';
const KEY_SECRET = 'secret';
const ALGORITHM = 'aes-256-cbc';

/**
 * 암호화되어있는 id, password를 복호화합니다.
 *
 * @param encrypted {@link encryptCredential} 를 사용하여 암호화 하였을 때 반환받은 key
 * @returns encrypted로 부터 얻은 id, password
 */
async function decryptCredential(encrypted: string): Promise<{ id: string; password: string } | undefined> {
	const hash = JSON.parse((await keytar.getPassword(SERVICE_NAME, KEY_SECRET)) ?? '{}');

	if (!('iv' in hash && 'secret' in hash)) return undefined;

	const decipher = crypto.createDecipheriv(ALGORITHM, Buffer.from(hash.secret, 'base64'), Buffer.from(hash.iv, 'base64'));
	const decrypted = Buffer.concat([decipher.update(Buffer.from(encrypted, 'base64')), decipher.final()]);

	return JSON.parse(decrypted.toString());
}

/**
 * id, password를 string으로 암호화한 후 저장합니다.
 *
 * @param credential 저장할 id, password
 * @returns 암호화 처리되어 저장된 id, password를 복호화할 수 있는 key
 */
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

const secure = {
	decryptCredential,
	encryptCredential,
};

export default secure;
