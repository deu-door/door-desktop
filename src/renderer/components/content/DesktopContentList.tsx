import React, { useMemo } from 'react';
import { Assignment, AssignmentHead, AssignmentVariantNames, Post, PostHead } from 'door-api';
import { DesktopContentListItem, DesktopContentListItemProps } from '../content/DesktopContentListItem';
import { DesktopVirtualList, DesktopVirtualListProps } from '../common/DesktopVirtualList';
import { useHistory } from 'react-router';
import { useCourse } from '../../hooks/door/useCourse';
import { startOfDay, startOfMonth, startOfToday, startOfWeek, startOfYesterday, subDays } from 'date-fns';

type ContentList = Array<(PostHead | Post) | (AssignmentHead | Assignment)>;

export type DesktopContentListProps = Omit<DesktopVirtualListProps, 'itemCount' | 'itemRenderer'> & {
	list: ContentList;
	sortBy?: (a: ContentList[0], b: ContentList[0]) => number;
	groupByCreatedAt?: boolean;
	VirtualListProps?: Partial<DesktopVirtualListProps>;
	ListItemProps?: Partial<DesktopContentListItemProps>;
};

export const DesktopContentList: React.FC<DesktopContentListProps> = props => {
	const {
		list: _list,
		sortBy = (a, b) => {
			const aDate = 'duration' in a ? a.duration.to : 'createdAt' in a ? a.createdAt : '';
			const bDate = 'duration' in b ? b.duration.to : 'createdAt' in b ? b.createdAt : '';

			return aDate !== bDate ? bDate.localeCompare(aDate) : b.id.localeCompare(a.id);
		},
		groupByCreatedAt,
		VirtualListProps,
		ListItemProps,
	} = props;
	const history = useHistory();
	const { courseById } = useCourse();

	const list = _list.sort(sortBy);

	const onClick = (content: (PostHead | Post) | (AssignmentHead | Assignment)) => {
		history.push(`/term/${courseById(content.courseId)?.termId}/course/${content.courseId}/${content.variant}/${content.id}`);
	};

	// memoization each date groups
	const { today, yesterday, dayBeforeYesterday, thisWeek, lastWeek, thisMonth, lastMonth } = useMemo(
		() => ({
			today: startOfToday().toISOString(),
			yesterday: startOfYesterday().toISOString(),
			dayBeforeYesterday: startOfDay(subDays(Date.now(), 2)).toISOString(),
			thisWeek: startOfWeek(Date.now()).toISOString(),
			lastWeek: startOfWeek(startOfWeek(Date.now()).getTime() - 1).toISOString(),
			thisMonth: startOfMonth(Date.now()).toISOString(),
			lastMonth: startOfMonth(startOfMonth(Date.now()).getTime() - 1).toISOString(),
		}),
		[startOfToday()],
	);

	const itemGroupByCreatedAt = (index: number) => {
		const item = list[index];
		const createdAt = 'duration' in item ? item.duration.to : 'createdAt' in item ? item.createdAt : '';

		return createdAt >= today
			? '오늘'
			: createdAt >= yesterday
			? '어제'
			: createdAt >= dayBeforeYesterday
			? '그저께'
			: createdAt >= thisWeek
			? '이번 주'
			: createdAt >= lastWeek
			? '지난 주'
			: createdAt >= thisMonth
			? '이번 달'
			: createdAt >= lastMonth
			? '지난 달'
			: '오래 전';
	};

	return (
		<DesktopVirtualList
			itemCount={list.length}
			itemRenderer={index => (
				<DesktopContentListItem
					key={`${list[index].variant}/${list[index].id}`}
					content={list[index]}
					onClick={() => onClick(list[index])}
					{...ListItemProps}
				/>
			)}
			itemGroup={groupByCreatedAt === true ? itemGroupByCreatedAt : undefined}
			{...VirtualListProps}
		/>
	);
};
