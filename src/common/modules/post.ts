import { createEntityAdapter, createSlice, isAnyOf } from '@reduxjs/toolkit';
import door from '../door';
import { createDoorAsyncThunk } from '../helper/createDoorAsyncThunk';
import { omit } from '../helper/object';
import { postListURI, postURI } from '../uri/uri';
import { WithURI } from '../uri/uri.interfaces';
import { Door, Post, NoticePost, NoticePostHead, ReferencePost, ReferencePostHead, PostVariant, PostHead } from 'door-api';
import { reset } from './user';

const adapter = createEntityAdapter<WithURI<PostHead | Post>>({
	selectId: post => post.uri,
});

const initialState = adapter.getInitialState();

const fetchNoticePostList = createDoorAsyncThunk<NoticePostHead[], Parameters<Door['getNoticePostList']>>({
	typePrefix: 'NoticePost/FetchList',
	getMeta: id => ({ uri: postListURI({ id, variant: PostVariant.NOTICE }) }),
	thunk:
		() =>
		(...params) =>
			door.getNoticePostList(...params),
});

const fetchNoticePost = createDoorAsyncThunk<NoticePost, Parameters<Door['getNoticePost']>>({
	typePrefix: 'NoticePost/FetchDetail',
	getMeta: ({ id }) => ({ uri: postURI({ id, variant: PostVariant.NOTICE }) }),
	thunk:
		() =>
		(...params) =>
			door.getNoticePost(...params),
});

const fetchReferencePostList = createDoorAsyncThunk<ReferencePostHead[], Parameters<Door['getReferencePostList']>>({
	typePrefix: 'ReferencePost/FetchList',
	getMeta: id => ({ uri: postListURI({ id, variant: PostVariant.REFERENCE }) }),
	thunk:
		() =>
		(...params) =>
			door.getReferencePostList(...params),
});

const fetchReferencePost = createDoorAsyncThunk<ReferencePost, Parameters<Door['getReferencePost']>>({
	typePrefix: 'ReferencePost/FetchDetail',
	getMeta: ({ id }) => ({ uri: postURI({ id, variant: PostVariant.REFERENCE }) }),
	thunk:
		() =>
		(...params) =>
			door.getReferencePost(...params),
});

const slice = createSlice({
	name: 'post',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(reset, state => Object.assign(state, initialState))
			.addMatcher(isAnyOf(fetchNoticePostList.fulfilled, fetchReferencePostList.fulfilled), (state, { payload: posts }) => {
				adapter.addMany(
					state,
					posts.map(post => ({
						uri: postURI(post),
						...post,
					})),
				);

				adapter.updateMany(
					state,
					posts.map(post => ({
						id: postURI(post),
						changes: {
							// resolution of createdAt is lower, so do not include in update
							...omit(post, 'partial', 'createdAt'),
						},
					})),
				);
			})
			.addMatcher(isAnyOf(fetchNoticePost.fulfilled, fetchReferencePost.fulfilled), (state, { payload: post }) => {
				adapter.upsertOne(state, { uri: postURI(post), ...post });
			});
	},
});

const post = {
	reducer: slice.reducer,
	actions: {
		fetchNoticePostList,
		fetchNoticePost,
		fetchReferencePostList,
		fetchReferencePost,
		// putSubmission,
	},
	selectors: {
		post: adapter.getSelectors(),
	},
};

export default post;
