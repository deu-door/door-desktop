import * as course from './course/course';
import * as syllabus from './course/syllabus';
import * as learningProgress from './lecture/lecture-progress';
import * as lecture from './lecture/lecture';
import * as activityPost from './post/activity-post';
import * as assignmentPost from './post/assignment-post';
import * as doorPost from './post/door-post';
import * as noticePost from './post/notice-post';
import * as referencePost from './post/reference-post';
import * as submission from './post/submission';
import * as teamProjectPost from './post/team-project-post';
import * as post from './post';
import * as term from './term';
import * as user from './user';

const door = {
	...course,
	...syllabus,
	...learningProgress,
	...lecture,
	...activityPost,
	...assignmentPost,
	...doorPost,
	...noticePost,
	...referencePost,
	...submission,
	...teamProjectPost,
	...post,
	...term,
	...user,
};

export default door;
