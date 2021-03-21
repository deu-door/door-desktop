import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import { persistReducer } from 'redux-persist';
import { persistedStorage } from 'store/modules/persisted-storage';
import { AsyncThunkTransform, ResetOnVersionChange } from './util';

import { IExternalLink } from 'models/online-resources';
import axios from 'axios';

const initialState: {
	externalLinks: IExternalLink[];
} = {
	externalLinks: [],
};

const fetchExternalLinks = createAsyncThunk<IExternalLink[], void>(
	'online-resources/fetchExternalLinks',
	async (_, { rejectWithValue }) => {
		try {
			const response = await axios.get(
				'https://raw.githubusercontent.com/deu-door/door-desktop-online-resources/main/external-links.json',
			);

			const externalLinks: IExternalLink[] = response.data;

			return externalLinks;
		} catch (e) {
			// TODO: implement errors
			return rejectWithValue(e);
		}
	},
);

const onlineResourcesSlice = createSlice({
	name: 'online-resources',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder.addCase(fetchExternalLinks.fulfilled, (state, { payload: externalLinks }) => {
			state.externalLinks = externalLinks;
		}),
});

export const reducer = persistReducer(
	{
		key: 'online-resources',
		storage: persistedStorage,
		transforms: [AsyncThunkTransform],
		version: 1,
		migrate: ResetOnVersionChange,
	},
	onlineResourcesSlice.reducer,
) as typeof onlineResourcesSlice.reducer;

export const actions = {
	fetchExternalLinks,
};
