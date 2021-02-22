import React from 'react';
import { Client, IMessage } from '@stomp/stompjs';

// eslint-disable-next-line @typescript-eslint/no-empty-function
const NoOp = () => {};

const RECONNECT_DELAY = 3000;

export type StompMessage = Record<any, any>;

export type StompClientProps = {
	clientRef: (instance: StompClient) => void;
	endpoint: string;
	topic?: string;
	onConnect?: () => void;
	onDisconnect?: () => void;
	onMessage?: (message: StompMessage) => void;
	debug?: boolean;
};

export class StompClient extends React.Component<StompClientProps> {
	state: Readonly<{ client?: Client }> = {};

	_isMounted = false;

	private createNewClient(): void {
		this.state.client?.deactivate();

		console.log('StompClient: Connect to ' + this.props.endpoint);

		const client = new Client({
			brokerURL: this.props.endpoint,
			debug: this.props.debug ? console.debug : NoOp,
			reconnectDelay: RECONNECT_DELAY,
		});
		client.onConnect = () => this.onConnect();
		client.onDisconnect = () => this.onDisconnect();
		client.activate();

		this.setState({ client });
	}

	private unsubscribe(topic: string): void {
		this.state.client?.unsubscribe(topic);
	}

	private subscribe(): void {
		if (this.props.topic)
			this.state.client?.subscribe(this.props.topic, message =>
				this.onMessage(message),
			);
	}

	public sendMessage(destination: string, message: string): void {
		this.state.client?.publish({
			destination: destination,
			body: message,
		});
	}

	private onConnect(): void {
		if (!this._isMounted) return;

		console.log('StompClient: Connected');
		this.subscribe();

		this.props.onConnect?.();
	}

	private onDisconnect(): void {
		if (!this._isMounted) return;

		this.props.onDisconnect?.();
	}

	private onMessage(message: IMessage): void {
		if (!this._isMounted) return;

		try {
			this.props.onMessage?.(JSON.parse(message.body) as StompMessage);
		} catch (e) {
			console.error(
				'StompClient: Cannot parse message as JSON. See below :',
			);
			console.error('  Error: ', e);
			console.error('  Message: ', message);
		}
	}

	public shouldComponentUpdate(): boolean {
		return false;
	}

	public componentDidMount(): void {
		this._isMounted = true;
		this.props.clientRef(this);

		this.createNewClient();
	}

	public componentWillUnmount(): void {
		this.state.client?.deactivate();
		this._isMounted = false;
	}

	public componentDidUpdate(props: StompClientProps): void {
		if (props.endpoint !== this.props.endpoint) {
			this.createNewClient();
		} else if (props.topic !== this.props.topic) {
			if (props.topic) this.unsubscribe(props.topic);
			this.subscribe();
		}
	}

	public render(): React.ReactNode {
		return <>{this.props.children}</>;
	}
}
