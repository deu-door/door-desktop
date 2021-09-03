export class DoorDesktopError extends Error {
	constructor(message?: string) {
		super(message);
		this.name = 'DoorDesktopError';
	}
}

export class SavedCredentialError extends DoorDesktopError {
	constructor(message?: string) {
		super(message);
		this.name = 'SavedCredentialError';
	}
}
