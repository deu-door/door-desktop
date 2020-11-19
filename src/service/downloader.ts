import { EventEmitter } from 'events';
import Electron from 'electron';
import { doorAxios } from './door/util';

const { session } = window.require('electron').remote;

const eventEmitter = new EventEmitter();

export interface Progress {
	percent: number;
	transferredBytes: number;
	totalBytes: number;
}

type DownloadEvent = 'start' | 'progress' | 'pause' | 'cancel' | 'failed' | 'complete';

type Listener = (item: Electron.DownloadItem) => void;

export const downloader = {
	on: (event: DownloadEvent, listener: Listener): EventEmitter => eventEmitter.addListener(event, listener),
	emit: (event: DownloadEvent, item: Electron.DownloadItem): boolean => eventEmitter.emit(event, item),
	remove: (event: DownloadEvent, listener: Listener): EventEmitter => eventEmitter.removeListener(event, listener),
	
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

downloader.on('start', item => console.log('Starting download ...', item));
downloader.on('progress', item => console.log('Received bytes: ' + item.getReceivedBytes(), item));
downloader.on('pause', item => console.log('Download is paused.', item));
downloader.on('cancel', item => console.log('Download cancelled.', item));
downloader.on('failed', item => console.log('Download failed.', item));
downloader.on('complete', item => console.log('Download complete.', item));

session.defaultSession.on('will-download', (event, item) => {
	downloader.emit('start', item);

	item.on('updated', (event, state) => {
		if(state === 'interrupted') {
			console.log('Download is interrupted but can be resumed.');

			downloader.emit('pause', item);
		}else if(state === 'progressing') {
			if(item.isPaused()) {
				downloader.emit('pause', item);
			}else{
				downloader.emit('progress', item);
			}
		}
	});

	item.once('done', (event, state) => {
		if(state === 'completed') {
			downloader.emit('complete', item);
		}else if(state === 'cancelled') {
			downloader.emit('cancel', item);
		}else {
			downloader.emit('failed', item);
		}
	});
});
