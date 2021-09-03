let scheduleIdCounter = 0;
const scheduleRegistry: Record<number, NodeJS.Timer> = {};

export function cancelRun(id: number): void {
	const timer = scheduleRegistry[id];
	if (timer !== undefined) clearTimeout(timer);

	delete scheduleRegistry[id];
}

export function runEvery(callback: () => void, ms: number): number {
	const id = scheduleIdCounter;
	const fn = () =>
		setTimeout(() => {
			callback();

			scheduleRegistry[id] = fn();
		}, ms);

	scheduleRegistry[id] = fn();

	scheduleIdCounter += 1;
	return id;
}
