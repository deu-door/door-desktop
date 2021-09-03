import { createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { Door, Term } from 'door-api';
import door from '../door';
import { termListURI } from '../uri/uri';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { reset } from './user';

const adapter = createEntityAdapter<Term>({
	selectId: term => term.id,
});

const initialState = adapter.getInitialState();

const fetchTermList = createDoorAsyncThunk<Term[], Parameters<Door['getTermList']>>({
	typePrefix: 'Term/FetchList',
	getMeta: () => ({ uri: termListURI() }),
	thunk: () => () => door.getTermList(),
});

const slice = createSlice({
	name: 'term',
	initialState,
	reducers: {},
	extraReducers: builder =>
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addCase(fetchTermList.fulfilled, (state, { payload: terms }) => {
				adapter.upsertMany(state, terms);
			}),
});

const term = {
	reducer: slice.reducer,
	actions: {
		fetchTermList,
	},
	selectors: {
		term: adapter.getSelectors(),
	},
};

export default term;
