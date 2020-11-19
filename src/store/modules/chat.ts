import { handleActions } from "redux-actions";
import { persistReducer } from "redux-persist";
import { getChatHistory } from "service/chat/history";
import { Message, MessageList } from "service/chat/interfaces/message";
import { FetchableMap, ID, notFulfilledFetchable } from "service/door/interfaces";
import { storage } from "store/storage";
import { FetchableAction } from ".";
import { AsyncState, fetchableActions, FetchableTransform, ResetOnVersionChange } from "./util";

export interface ChatState extends AsyncState {
	rooms: Record<ID, MessageList>
}

const initialState: ChatState = {
	fulfilled: false,
	pending: false,
	rooms: {}
}

const historyActions = fetchableActions<ChatState, MessageList, ID>({
	name: 'CHAT_HISTORY',
	selector: state => state.chat,
	path: (draft, courseId) => {
		if(!draft.rooms[courseId]) {
			draft.rooms[courseId] = {
				courseId: courseId,
				messages: [],
				...notFulfilledFetchable()
			};
		}
		return draft.rooms[courseId];
	},
	fetch: courseId => getChatHistory(courseId)
});

export default persistReducer(
	{
		key: 'user',
		storage: storage,
		transforms: [FetchableTransform],
		version: 1,
		migrate: ResetOnVersionChange()
	},
	handleActions<ChatState, any>({
		...historyActions.reduxActions
	}, initialState)
);

export const actions = {
	history: (courseId: ID): FetchableAction => historyActions.actions(courseId)
}