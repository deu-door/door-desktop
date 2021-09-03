import createMigrate from 'redux-persist/es/createMigrate';
import { PersistMigrate } from 'redux-persist/es/types';

/**
 * redux-persist: 저장된 데이터의 스키마가 바뀌었을 때 마이그레이션 없이 초기화하는 PersistMigrate
 */
export const ResetOnVersionChange: PersistMigrate = createMigrate(
	// No migration yet. Data will be reseted when version change.
	// reserved for 0 to 100 versions.
	Object.fromEntries(new Array(100).fill(0).map((_, version) => [version, state => undefined])),
	{ debug: true },
);
