import { fulfilledFetchable, ID } from "service/door/interfaces";
import { chatAxios } from ".";
import { Message, MessageList } from "./interfaces/message";

export async function getChatHistory(courseId: ID): Promise<MessageList> {
	const response = await chatAxios.get(`/history?topic=/topic/courses/${courseId}`);

	return {
		courseId: courseId,
		messages: response.data,

		...fulfilledFetchable()
	};
}