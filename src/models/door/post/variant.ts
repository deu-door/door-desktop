export enum PostVariant {
	activity = 'activity',
	assignment = 'assignment',
	door = 'door',
	notice = 'notice',
	reference = 'reference',
	teamProject = 'teamProject',
}

export const PostVariants = [
	PostVariant.activity,
	PostVariant.assignment,
	PostVariant.door,
	PostVariant.notice,
	PostVariant.reference,
	PostVariant.teamProject,
] as const;

export const PostVariantNames = {
	[PostVariant.notice]: '공지사항',
	[PostVariant.reference]: '강의자료',
	[PostVariant.assignment]: '과제',
	[PostVariant.door]: 'Door',
	[PostVariant.teamProject]: '팀 프로젝트',
	[PostVariant.activity]: '수업활동일지',
} as const;
