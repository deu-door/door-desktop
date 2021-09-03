import { createAction, createEntityAdapter, createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Attachment } from 'door-api';
import { nanoid } from 'nanoid';
import { DownloadItem } from '../download/download.interfaces';
import door from '../door';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import log from 'electron-log';
import { reset } from './user';

const adapter = createEntityAdapter<DownloadItem>({
	selectId: item => item.id,
});

const initialState = adapter.getInitialState();

const startDownload = createDoorAsyncThunk<void, [attachment: Attachment]>({
	typePrefix: 'Download/Download',
	thunk:
		({ dispatch }) =>
		async attachment => {
			const { addDownloadItem, updateDownloadItem } = slice.actions;
			const id = nanoid();

			// dynamically load node.js module (for restrict on renderer process)
			const { default: unusedFilename } = await import('unused-filename');
			const { default: path } = await import('path');
			const { app } = await import('electron');

			const savePath = unusedFilename.sync(path.join(app.getPath('downloads'), attachment.title));

			dispatch(
				addDownloadItem({
					id,
					filename: attachment.title,
					url: attachment.url,
					savePath,
					lengthComputable: false,
					totalBytes: 0,
					receivedBytes: 0,
					progress: 0,
					state: 'progressing',
					startAt: new Date().toISOString(),
				}),
			);

			const { default: fs } = await import('fs');

			// ugly IIFE ... but better than type unsafe let variables
			const { stream, headers } = await (async () => {
				try {
					const response = await door.download(attachment);

					return { stream: response.data, headers: response.headers };
				} catch (error) {
					dispatch(updateDownloadItem({ id, state: 'cancelled', error: error instanceof Error ? error.message : String(error) }));

					return { stream: undefined, headers: undefined };
				}
			})();

			if (stream === undefined || headers === undefined) return;

			const totalBytes = Number(headers['content-length']);
			const lengthComputable = !isNaN(totalBytes);
			const file = fs.createWriteStream(savePath);

			log.info(`Starting download file ... filename=${attachment.title}`);

			dispatch(updateDownloadItem({ id, lengthComputable, totalBytes, state: 'progressing' }));

			let nextUpdate = 0;
			let receivedBytes = 0;

			stream.on('data', chunk => {
				receivedBytes += chunk.length;

				if (nextUpdate > Date.now()) return;
				nextUpdate = Date.now() + 250;

				dispatch(
					updateDownloadItem({
						id,
						receivedBytes,

						...(lengthComputable ? { progress: receivedBytes / totalBytes } : { totalBytes: receivedBytes }),
					}),
				);

				log.info(`Download file ... filename=${attachment.title} receivedBytes=${receivedBytes}`);
			});

			stream.on('error', error => {
				dispatch(updateDownloadItem({ id, state: 'cancelled', error: `${error.message} (${error.name})` }));
				fs.unlinkSync(savePath);

				log.info(
					`Error occured while downlod! filename=${attachment.title} error.name=${error.name} error.message=${error.message}`,
				);
			});

			file.on('finish', () => {
				dispatch(
					updateDownloadItem({
						id,
						state: 'completed',
						totalBytes,
						progress: 1,
					}),
				);
				file.close(); // close stream

				log.info(`Complete donwload file! filename=${attachment.title}`);
			});

			stream.pipe(file);
		},
});

const openFile = createAction('Download/OpenFile', (savePath: DownloadItem['savePath']) => ({
	payload: savePath,
	meta: { scope: 'local' }, // electron-redux: do not propagate this action to renderer process
}));

const openFolder = createAction('Download/OpenFolder', (savePath: DownloadItem['savePath']) => ({
	payload: savePath,
	meta: { scope: 'local' }, // electron-redux: do not propagate this action to renderer process
}));

const slice = createSlice({
	name: 'download',
	initialState,
	reducers: {
		// managed by downloader
		addDownloadItem(state, { payload: item }: PayloadAction<DownloadItem>) {
			adapter.upsertOne(state, item);
		},

		// managed by downloader
		updateDownloadItem(state, { payload: item }: PayloadAction<Partial<DownloadItem> & Pick<DownloadItem, 'id'>>) {
			adapter.updateOne(state, {
				id: item.id,
				changes: item,
			});
		},
	},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(openFile, (state, { payload: savePath }) => {
				import('electron').then(({ shell }) => shell.openPath(savePath));
			})
			.addCase(openFolder, (state, { payload: savePath }) => {
				import('electron').then(({ shell }) => shell.showItemInFolder(savePath));
			}),
});

const download = {
	reducer: slice.reducer,
	actions: {
		...slice.actions,

		startDownload,
		openFile,
		openFolder,
	},
	selectors: {
		download: adapter.getSelectors(),
	},
};

export default download;
