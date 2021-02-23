import {
	CourseSubordinated,
	Fetchable,
	Identifiable,
} from 'service/door/interfaces';

export interface Message extends Identifiable {
	id: string;
	userId: string;
	user: string;

	message: string;
	topic: string;
	timestamp: number;
}

export interface MessageList extends Fetchable, CourseSubordinated {
	courseId: string;

	messages: Message[];
}
