import * as course from './course';
import * as notice from './notice';
import * as lecture from './lecture';
import * as assignment from './assignment';
import * as reference from './reference';
import * as activity from './activity';
import * as teamProject from './team-project';
import * as learningStatus from './learning-status';
import * as user from './user';

export default {
	...course,
	...notice,
	...lecture,
	...assignment,
	...reference,
	...activity,
	...teamProject,
	...learningStatus,
	...user
};
