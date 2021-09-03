import React, { useEffect, useState } from 'react';
import { Box, IconButton, LinearProgress, Link, Snackbar, SnackbarContent, Typography, useTheme } from '@material-ui/core';
import { Close } from '@material-ui/icons';
import { DownloadItem } from '../../common/download/download.interfaces';
import { useDownload } from '../hooks/download/useDownload';
import { DesktopSpacer } from '../components/common/DesktopSpacer';

const bytesToSize = (bytes: number): string => {
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
	if (bytes === 0) return '0 Byte';

	const i = Number(Math.floor(Math.log(bytes) / Math.log(1024)));
	return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + ' ' + sizes[i];
};

export type DesktopDownloadProps = {
	item: DownloadItem;
};

export const DesktopDownload: React.FC<DesktopDownloadProps> = props => {
	const { item } = props;
	const theme = useTheme();
	const { openFile, openFolder } = useDownload();

	const [open, setOpen] = useState(true);
	const onClose = () => setOpen(false);

	// alert once when donwload complete
	useEffect(() => {
		if (item.state === 'completed') setOpen(true);
	}, [item.state]);

	return (
		<Snackbar
			style={{
				margin: theme.spacing(2),
				position: 'unset',
				right: 'unset',
				left: 'unset',
				bottom: 'unset',
				transform: 'unset',
				display: 'block',
			}}
			open={open}
		>
			<SnackbarContent
				style={{ display: 'block' }}
				message={
					<>
						<Box display="flex" alignItems="center" justifyContent="space-between">
							<Typography variant="body2">
								<strong>{item.filename}</strong>
								{item.state === 'progressing'
									? ' 을 다운로드 중입니다 ...'
									: item.state === 'cancelled'
									? ' 의 다운로드기 중단되었습니다.'
									: item.state === 'completed'
									? ' 이 다운로드되었습니다.'
									: ''}
							</Typography>

							<DesktopSpacer horizontal={2} />

							<IconButton size="small" color="inherit" onClick={() => onClose()}>
								<Close />
							</IconButton>
						</Box>

						<DesktopSpacer vertical={2} />

						<Box display="flex">
							<Typography variant="body2" color="inherit">
								{item.lengthComputable
									? `${bytesToSize(item.receivedBytes)} / ${bytesToSize(item.totalBytes)}`
									: bytesToSize(item.receivedBytes)}
							</Typography>

							<DesktopSpacer horizontal="auto" />

							<Link
								component="button"
								onClick={() => {
									openFolder(item.savePath);
									onClose();
								}}
							>
								폴더 열기
							</Link>
							<DesktopSpacer horizontal={2} />
							<Link
								disabled={item.state === 'progressing'}
								component="button"
								onClick={() => {
									openFile(item.savePath);
									onClose();
								}}
							>
								열기
							</Link>
							<DesktopSpacer horizontal={2} />
						</Box>

						{item.state === 'progressing' && (
							<>
								<DesktopSpacer vertical={1} />
								<Box>
									<LinearProgress
										variant={item.lengthComputable ? 'determinate' : 'indeterminate'}
										value={item.progress}
									/>
								</Box>
							</>
						)}
					</>
				}
			/>
		</Snackbar>
	);
};

export const DesktopDownloadList: React.FC = props => {
	const { downloadItemList } = useDownload();

	return (
		<Box position="fixed" bottom={0} right={0} zIndex={999}>
			{Object.values(downloadItemList).map(item => (
				<DesktopDownload key={item.id} item={item} />
			))}
		</Box>
	);
};
