import { List, ListItem, ListProps, Typography } from '@material-ui/core';
import React, { useState } from 'react';
import { DesktopListSubheader } from './DesktopListSubheader';

export type DesktopVirtualListProps = ListProps & {
	empty?: React.ReactNode;
	defaultThreshold?: number;
	expandThresholdSize?: number;
	itemCount: number;
	itemRenderer: (index: number) => React.ReactNode | undefined;
	itemGroup?: (index: number) => string;
};

export const DesktopVirtualList: React.FC<DesktopVirtualListProps> = props => {
	const {
		empty,
		defaultThreshold = 50,
		expandThresholdSize = defaultThreshold,
		itemCount,
		itemRenderer,
		itemGroup,
		...otherProps
	} = props;

	const [expandedCount, setExpandedCount] = useState(0);
	const threshold = defaultThreshold + expandThresholdSize * expandedCount;

	const items = Array(Math.min(threshold, itemCount))
		.fill(undefined)
		.map((_, index) => itemRenderer(index));

	let currentGroup: string | undefined = undefined;

	return (
		<List disablePadding {...otherProps}>
			{items.length === 0 ? (
				<ListItem>{empty ?? <Typography color="textSecondary">목록이 비어있습니다</Typography>}</ListItem>
			) : (
				<>
					{itemGroup === undefined
						? items
						: // make group with itemGroup function
						  items.map((item, index) => {
								const group = itemGroup(index);
								if (currentGroup !== group) {
									currentGroup = group;
									return (
										<>
											<DesktopListSubheader>{group}</DesktopListSubheader>
											{item}
										</>
									);
								}
								return item;
						  })}
					{items.length < itemCount && (
						<ListItem
							button
							onClick={() => setExpandedCount(expandedCount + 1)}
							style={{ display: 'flex', justifyContent: 'center' }}
						>
							<Typography variant="subtitle2" color="textSecondary">
								더보기
							</Typography>
						</ListItem>
					)}
				</>
			)}
		</List>
	);
};
