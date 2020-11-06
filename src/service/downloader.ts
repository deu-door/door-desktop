import { EventEmitter } from 'events';
import Electron from 'electron';
import { doorAxios } from './door';

const { session } = window.require('electron').remote;

const eventEmitter = new EventEmitter();

export interface Progress {
	percent: number;
	transferredBytes: number;
	totalBytes: number;
}

type Listener = (item: Electron.DownloadItem) => void;

export const downloader = {
	onStarted: (listener: Listener): EventEmitter => eventEmitter.addListener('start', listener),
	onProgress: (listener: Listener): EventEmitter => eventEmitter.addListener('progress', listener),
	onPause: (listener: Listener): EventEmitter => eventEmitter.addListener('pause', listener),
	onCancel: (listener: Listener): EventEmitter => eventEmitter.addListener('cancel', listener),
	onFailed: (listener: Listener): EventEmitter => eventEmitter.addListener('failed', listener),
	onComplete: (listener: Listener): EventEmitter => eventEmitter.addListener('complete', listener),
	
	download: async (url: string): Promise<void> => {
		if(url.startsWith('/')) url = 'http://door.deu.ac.kr' + url;

		session.defaultSession.downloadURL(url);
	},

	isDownloadable: async (url: string): Promise<boolean> => {
		const response = await doorAxios.head(url);

		console.log(response.headers);
	
		if(response.headers['content-disposition']?.startsWith('attachment'
			|| !response.headers['content-type']?.startsWith('text/'))) {
				return true;
			}
		
		return false;
	}
};


downloader.onStarted(item => console.log('Starting download ...', item));
downloader.onProgress(item => console.log('Received bytes: ' + item.getReceivedBytes(), item));
downloader.onPause(item => console.log('Download is paused.', item));
downloader.onCancel(item => console.log('Download cancelled.', item));
downloader.onFailed(item => console.log('Download failed.', item));
downloader.onComplete(item => console.log('Download complete.', item));

session.defaultSession.on('will-download', (event, item) => {
	eventEmitter.emit('start', item);

	item.on('updated', (event, state) => {
		if(state === 'interrupted') {
			console.log('Download is interrupted but can be resumed.');

			eventEmitter.emit('pause', item);
		}else if(state === 'progressing') {
			if(item.isPaused()) {
				eventEmitter.emit('pause', item);
			}else{
				eventEmitter.emit('progress', item);
			}
		}
	});

	item.once('done', (event, state) => {
		if(state === 'completed') {
			eventEmitter.emit('complete', item);
		}else if(state === 'cancelled') {
			eventEmitter.emit('cancel', item);
		}else {
			eventEmitter.emit('failed', item);
		}
	});
});
