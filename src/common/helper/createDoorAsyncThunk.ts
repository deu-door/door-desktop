/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
import { AnyAction, createAsyncThunk, ThunkDispatch } from '@reduxjs/toolkit';

type AsyncThunkConfig = {
	dispatch: ThunkDispatch<any, void, AnyAction>;
};

/**
 * Door Desktop에서 반복되어 사용되는 코드를 줄이기 위해 createAsyncThunk를 wrapping한 자체 함수
 *
 * 파라미터는 약간의 차이가 있지만 반환되는 값은 동일하다
 */
// eslint-disable-next-line @typescript-eslint/ban-types
export function createDoorAsyncThunk<Returned, ThunkArg extends any[] = []>({
	typePrefix,
	getMeta,
	thunk,
}: {
	typePrefix: string;
	getMeta?: (...args: ThunkArg) => Record<string, unknown>;
	// eslint-disable-next-line @typescript-eslint/ban-types
	thunk: <ThunkApiConfig extends AsyncThunkConfig>(api: ThunkApiConfig) => (...params: ThunkArg) => Promise<Returned>;
}) {
	const asyncThunk = createAsyncThunk<
		Returned,
		ThunkArg,
		{ rejectedMeta: Record<string, unknown>; fulfilledMeta: Record<string, unknown> }
	>(
		typePrefix,
		async (args, thunkApi) => {
			const { rejectWithValue, fulfillWithValue } = thunkApi;

			try {
				const result = await thunk(thunkApi)(...args);

				return fulfillWithValue(result, getMeta?.(...args) ?? {});
			} catch (error) {
				return rejectWithValue(
					error instanceof Error ? { name: error.name, message: error.message } : error,
					getMeta?.(...args) ?? {},
				);
			}
		},
		{
			getPendingMeta: ({ arg: args }) => getMeta?.(...args) ?? {},
		},
	);

	function actionCreator(...params: ThunkArg) {
		return asyncThunk(params);
	}

	return Object.assign(actionCreator, {
		pending: asyncThunk.pending,
		fulfilled: asyncThunk.fulfilled,
		rejected: asyncThunk.rejected,
		typePrefix: asyncThunk.typePrefix,
	});
}
