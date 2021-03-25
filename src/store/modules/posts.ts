import { createAsyncThunk, createEntityAdapter, createSlice } from '@reduxjs/toolkit';
import { ICourse, IPost, IPostHead, PostVariant, ResourceID } from 'models/door';
import { persistReducer } from 'redux-persist';
import door from 'services/door';
import { HttpError } from 'services/response';
import { persistedStorage } from 'store/modules/persisted-storage';
import { reset } from './user';
import {
	IAsyncThunkState,
	AsyncThunkTransform,
	ResetOnVersionChange,
	toPending,
	toFulfilled,
	toRejectedWithError,
	UserDataTransform,
} from './util';

type CourseAsyncState = Record<PostVariant, IAsyncThunkState> & Pick<ICourse, 'id'>;

type PostUniqueIdentifiable = { _internalUniqueId: ResourceID };

export const postUniqueId = (post: Pick<IPost, 'variant' | 'id'>): ResourceID => `${post.variant}#${post.id}`;

/**
 * Uses for locking each course request state (pending, error)
 */
const byCourseAdapter = createEntityAdapter<CourseAsyncState>({
	selectId: course => course.id,
});

/**
 * Common adapter for interfaces which implements IPost
 */
const postsAdapter = createEntityAdapter<(IPost | IPostHead) & PostUniqueIdentifiable & IAsyncThunkState>({
	selectId: post => post._internalUniqueId,
});

const initialState = {
	byCourse: byCourseAdapter.getInitialState(),
	posts: postsAdapter.getInitialState(),
};

const fetchPosts = createAsyncThunk<IPostHead[], Parameters<typeof door.getPosts>[0], { rejectValue: HttpError }>(
	'posts/fetchMany',
	async (params, { rejectWithValue }) => {
		try {
			const response = await door.getPosts(params);

			return response.data;
		} catch (e) {
			const error: HttpError = e;
			return rejectWithValue(error);
		}
	},
);

const fetchPost = createAsyncThunk<IPost, Parameters<typeof door.getPost>[0], { rejectValue: HttpError }>(
	'posts/fetchDetail',
	async (params, { rejectWithValue }) => {
		try {
			const response = await door.getPost(params);

			return response.data;
		} catch (e) {
			const error: HttpError = e;
			return rejectWithValue(error);
		}
	},
);

const putSubmission = createAsyncThunk<void, Parameters<typeof door.putSubmission>[0], { rejectValue: HttpError }>(
	'posts/putSubmission',
	async (params, { rejectWithValue }) => {
		try {
			await door.putSubmission(params);
		} catch (e) {
			const error: HttpError = e;
			return rejectWithValue(error);
		}
	},
);

const postsSlice = createSlice({
	name: 'notices',
	initialState,
	reducers: {},
	extraReducers: builder => {
		builder
			.addCase(reset, state => {
				Object.assign(state, initialState);
			})
			.addCase(fetchPosts.pending, (state, { meta: { arg } }) => {
				// first initialized values
				byCourseAdapter.addOne(state.byCourse, {
					id: arg.id,
					...Object.fromEntries(Object.keys(PostVariant).map(variant => [variant, { pending: false, error: undefined }])),
				} as CourseAsyncState);

				byCourseAdapter.updateOne(state.byCourse, {
					id: arg.id,
					changes: {
						[arg.variant]: toPending({}),
					},
				});
			})
			.addCase(fetchPosts.fulfilled, (state, { meta: { arg }, payload: posts }) => {
				byCourseAdapter.updateOne(state.byCourse, {
					id: arg.id,
					changes: {
						[arg.variant]: toFulfilled({}),
					},
				});

				// postsAdapter.addMany(
				// 	state.posts,
				// 	(posts as IPostHead[]).map(post => ({
				// 		_internalUniqueId: postUniqueId({ variant: arg.variant, id: post.id })

				// 		...post,
				// 		pending: false,
				// 		error: undefined
				// 	}))
				// )

				// TODO: exceptional field "createdAt", compare previous and current and choose latest one`

				postsAdapter.upsertMany(
					state.posts,
					(posts as IPostHead[]).map(post => {
						const _internalUniqueId = postUniqueId({ variant: arg.variant, id: post.id });

						return {
							// use previous values
							//...postsAdapter.getSelectors().selectById(state.posts, _internalUniqueId),

							_internalUniqueId,

							...post,
							pending: false,
							error: undefined,
							fulfilledAt: undefined,
						};
					}),
				);
			})
			.addCase(fetchPosts.rejected, (state, { meta: { arg }, payload: error }) => {
				byCourseAdapter.updateOne(state.byCourse, {
					id: arg.id,
					changes: {
						[arg.variant]: toRejectedWithError({}, error?.message),
					},
				});
			})
			.addCase(fetchPost.pending, (state, { meta: { arg } }) => {
				postsAdapter.updateOne(state.posts, {
					id: postUniqueId(arg),
					changes: toPending({}),
				});
			})
			.addCase(fetchPost.fulfilled, (state, { meta: { arg }, payload: newPost }) => {
				postsAdapter.updateOne(state.posts, {
					id: postUniqueId(arg),
					changes: {
						...newPost,

						...toFulfilled({}),
					},
				});
			})
			.addCase(fetchPost.rejected, (state, { meta: { arg }, payload: error }) => {
				postsAdapter.updateOne(state.posts, {
					id: postUniqueId(arg),
					changes: toRejectedWithError({}, error?.message),
				});
			});
	},
});

export const reducer = persistReducer(
	{
		key: 'posts',
		storage: persistedStorage,
		transforms: [UserDataTransform, AsyncThunkTransform],
		version: 2,
		migrate: ResetOnVersionChange,
	},
	postsSlice.reducer,
) as typeof postsSlice.reducer;

export const actions = {
	fetchPosts,
	fetchPost,
	putSubmission,
};

export const selectors = {
	byCourseSelectors: byCourseAdapter.getSelectors(),
	postsSelectors: postsAdapter.getSelectors(),
};
