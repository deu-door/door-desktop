import React, { useEffect, useState } from 'react';
import { downloader } from 'service/downloader';
import {
	createStyles,
	Grid,
	IconButton,
	LinearProgress,
	makeStyles,
	Snackbar,
	SnackbarContent,
	Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

const useStyles = makeStyles(theme =>
	createStyles({
		notifications: {
			position: 'fixed',
			bottom: 0,
			right: 0,
		},
		notification: {
			margin: theme.spacing(2),
			position: 'unset',
			right: 'unset',
			left: 'unset',
			bottom: 'unset',
			transform: 'unset',
			display: 'block',
		},
		notificationContent: {
			display: 'block',
		},
		notificationProgressText: {
			marginTop: theme.spacing(2),
		},
		notificationProgress: {
			marginTop: theme.spacing(1),
		},
	}),
);

interface DownloadProgress {
	path: string;
	name: string;

	// 1MB, 3.2MB ...
	totalSize: string;
	receivedSize: string;

	// 0 ~ 100
	progress: number;

	message?: string;
	complete: boolean;
}

const bytesToSize = (bytes: number): string => {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0Byte';

	const i = Number(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + sizes[i];
};

export const Download: React.FC<{ item: DownloadProgress }> = props => {
	const { item } = props;
	const classes = useStyles();
	const [open, setOpen] = useState(true);

	return (
		<Snackbar className={classes.notification} open={open}>
			<SnackbarContent
				className={classes.notificationContent}
				message={
					<>
						<Grid
							container
							justify="space-between"
							alignItems="center"
							spacing={1}
						>
							<Grid item>
								{!item.complete
									? `${item.name} 파일을 다운로드 중입니다 ...`
									: `${item.name} 파일이 다운로드되었습니다.`}
							</Grid>
							<Grid item>
								<IconButton
									size="small"
									color="inherit"
									onClick={() => setOpen(false)}
								>
									<Close />
								</IconButton>
							</Grid>
						</Grid>

						{!item.complete && (
							<>
								<Typography
									variant="body2"
									align="right"
									className={classes.notificationProgressText}
								>
									{`${item.receivedSize} / ${item.totalSize}`}
								</Typography>
								<div>
									<LinearProgress
										variant="determinate"
										value={item.progress}
										className={classes.notificationProgress}
									/>
								</div>
							</>
						)}
					</>
				}
			/>
		</Snackbar>
	);
};

const listeners: Record<string, (item: Electron.DownloadItem) => void> = {};

downloader.on('start', item => listeners.start?.(item));
downloader.on('progress', item => listeners.progress?.(item));
downloader.on('complete', item => listeners.complete?.(item));

export const Downloads: React.FC = props => {
	const [items, setItems] = useState<{ [key: string]: DownloadProgress }>({});
	const classes = useStyles();

	useEffect(() => {
		const update = (
			item: Electron.DownloadItem,
			properties: { message?: string; complete: boolean },
		) => {
			const path = item.getSavePath();

			setItems({
				...items,

				[path]: {
					path: path,
					name: item.getFilename(),

					totalSize: bytesToSize(item.getTotalBytes()),
					receivedSize: bytesToSize(item.getReceivedBytes()),

					progress:
						(item.getReceivedBytes() / item.getTotalBytes()) * 100,

					message: properties.message,
					complete: properties.complete,
				},
			});
		};

		const onProgress = (item: Electron.DownloadItem) =>
			update(item, { complete: false });

		const onComplete = (item: Electron.DownloadItem) =>
			update(item, { complete: true });

		listeners.start = onProgress;
		listeners.progress = onProgress;
		listeners.complete = onComplete;
	}, [items]);

	return (
		<div className={classes.notifications}>
			{Object.values(items).map(item => (
				<Download item={item} />
			))}
		</div>
	);
};
