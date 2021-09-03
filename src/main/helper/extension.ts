import installExtension, { REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS } from 'electron-devtools-installer';
import log from 'electron-log';

/**
 * 크롬 확장프로그램 설치 함수
 */
export async function installExtensions(): Promise<void> {
	for (const extension of [REACT_DEVELOPER_TOOLS, REDUX_DEVTOOLS]) {
		try {
			const name = await installExtension(extension);
			log.info(`Extension "${name}" successfully installed.`);
		} catch (e) {
			log.error(`Error while installing extension "${extension}".`, e);
		}
	}
}
