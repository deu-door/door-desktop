import React from 'react';
import { Assignment, AssignmentHead, AssignmentVariantNames, Post, PostHead } from 'door-api';
import { DesktopContentListItem, DesktopContentListItemProps } from '../content/DesktopContentListItem';
import { DesktopVirtualList, DesktopVirtualListProps } from '../common/DesktopVirtualList';
import { useHistory } from 'react-router';
import { useCourse } from '../../hooks/door/useCourse';

type ContentList = Array<(PostHead | Post) | (AssignmentHead | Assignment)>;

export type DesktopContentListProps = Omit<DesktopVirtualListProps, 'itemCount' | 'itemRenderer'> & {
	title?: string;
	list: ContentList;
	sortBy?: (a: ContentList[0], b: ContentList[0]) => number;
	VirtualListProps?: Partial<DesktopVirtualListProps>;
	ListItemProps?: Partial<DesktopContentListItemProps>;
};

export const DesktopContentList: React.FC<DesktopContentListProps> = props => {
	const {
		title,
		list: _list,
		sortBy = (a, b) => {
			const aDate = 'duration' in a ? a.duration.to : 'createdAt' in a ? a.createdAt : '';
			const bDate = 'duration' in b ? b.duration.to : 'createdAt' in b ? b.createdAt : '';

			return aDate !== bDate ? bDate.localeCompare(aDate) : b.id.localeCompare(a.id);
		},
		VirtualListProps,
		ListItemProps,
	} = props;
	const history = useHistory();
	const { courseById } = useCourse();

	const list = _list.sort(sortBy);
	const variants = new Set<string>(list.map(content => content.variant));

	const onClick = (content: (PostHead | Post) | (AssignmentHead | Assignment)) => {
		history.push(`/term/${courseById(content.courseId)?.termId}/course/${content.courseId}/${content.variant}/${content.id}`);
	};

	return (
		<DesktopVirtualList
			title={
				title ??
				Object.entries(AssignmentVariantNames)
					.filter(([variant]) => variants.has(variant))
					.map(([, name]) => name)
					.join(' · ')
			}
			itemCount={list.length}
			itemRenderer={index => (
				<DesktopContentListItem
					key={`${list[index].variant}/${list[index].id}`}
					content={list[index]}
					onClick={() => onClick(list[index])}
					{...ListItemProps}
				/>
			)}
			{...VirtualListProps}
		/>
	);
};
