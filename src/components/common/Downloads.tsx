import React, { useEffect, useState } from 'react';
import { downloader } from 'services/downloader';
import {
	Box,
	createStyles,
	Grid,
	IconButton,
	LinearProgress,
	Link,
	makeStyles,
	Snackbar,
	SnackbarContent,
	Typography,
} from '@material-ui/core';
import { Close } from '@material-ui/icons';

const { shell } = window.require('electron').remote;

const useStyles = makeStyles(theme =>
	createStyles({
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

export type DownloadProps = {
	item: DownloadProgress;
	onClose?: () => void;
	open?: boolean;
};

export const Download: React.FC<DownloadProps> = props => {
	const { item, onClose, open } = props;
	const classes = useStyles();

	return (
		<Snackbar className={classes.notification} open={open}>
			<SnackbarContent
				className={classes.notificationContent}
				message={
					<>
						<Grid container justify="space-between" alignItems="center" spacing={1}>
							<Grid item>
								{!item.complete ? (
									`${item.name} 파일을 다운로드 중입니다 ...`
								) : (
									<Box display="flex">
										{`${item.name} 파일이 다운로드되었습니다.`}
										<Box width="0.8rem" />
										<Link
											component="button"
											onClick={() => {
												shell.openPath(item.path);
												onClose?.();
											}}
										>
											열기
										</Link>
									</Box>
								)}
							</Grid>
							<Grid item>
								<IconButton size="small" color="inherit" onClick={() => onClose?.()}>
									<Close />
								</IconButton>
							</Grid>
						</Grid>

						{!item.complete && (
							<>
								<Typography variant="body2" align="right" className={classes.notificationProgressText}>
									{`${item.receivedSize} / ${item.totalSize}`}
								</Typography>
								<div>
									<LinearProgress variant="determinate" value={item.progress} className={classes.notificationProgress} />
								</div>
							</>
						)}
					</>
				}
			/>
		</Snackbar>
	);
};

export const Downloads: React.FC = props => {
	const [items, setItems] = useState<{ [key: string]: DownloadProgress }>({});

	const upsert = (item: Electron.DownloadItem) => {
		const path = item.getSavePath();

		setItems({
			...items,

			[path]: {
				path: path,
				name: item.getFilename(),

				totalSize: bytesToSize(item.getTotalBytes()),
				receivedSize: bytesToSize(item.getReceivedBytes()),

				progress: (item.getReceivedBytes() / item.getTotalBytes()) * 100,

				complete: item.getReceivedBytes() === item.getTotalBytes(),
			},
		});
	};

	const remove = (path: string) => {
		setItems(
			Object.keys(items)
				.filter(_path => _path !== path)
				.reduce((object, path) => ({ ...object, [path]: items[path] }), {}),
		);
	};

	useEffect(() => {
		downloader.on('start', upsert);
		downloader.on('progress', upsert);
		downloader.on('complete', upsert);

		return () => {
			downloader.remove('start', upsert);
			downloader.remove('progress', upsert);
			downloader.remove('complete', upsert);
		};
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<Box position="fixed" bottom={0} right={0} zIndex={999}>
			{Object.values(items).map(item => (
				<Download key={item.path} item={item} onClose={() => remove(item.path)} open />
			))}
		</Box>
	);
};
