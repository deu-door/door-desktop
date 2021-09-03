import { actions, selectors } from '../../../common/modules';
import { useCallback } from 'react';
import { useDispatch } from 'react-redux';
import { useSelector } from '../../store';
import { DownloadItem } from '../../../common/download/download.interfaces';

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function useDownload() {
	const state = useSelector(state => state.download);

	const dispatch = useDispatch();

	const downloadItemList = selectors.download.selectAll(state);
	const downloadItemById = (id: DownloadItem['id']) => selectors.download.selectById(state, id);

	const startDownload = useCallback(
		(...params: Parameters<typeof actions.startDownload>) => dispatch(actions.startDownload(...params)),
		[dispatch],
	);
	const openFile = useCallback((...params: Parameters<typeof actions.openFile>) => dispatch(actions.openFile(...params)), [dispatch]);
	const openFolder = useCallback(
		(...params: Parameters<typeof actions.openFolder>) => dispatch(actions.openFolder(...params)),
		[dispatch],
	);

	return {
		downloadItemList,
		downloadItemById,

		startDownload,
		openFile,
		openFolder,
	};
}
