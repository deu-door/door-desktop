import {
	Box,
	BoxProps,
	CircularProgress,
	Drawer,
	Hidden,
	List,
	ListItem,
	ListItemText,
	ListSubheader,
	MenuItem,
	Select,
	SelectProps,
	styled,
	useTheme,
	withTheme,
} from '@material-ui/core';
import { Course, Term } from 'door-api';
import React, { useEffect, useState } from 'react';
import { courseListURI } from '../../common/uri/uri';
import { DesktopRoundedPaper } from '../components/common/DesktopRoundedPaper';
import { DesktopSpacer } from '../components/common/DesktopSpacer';
import { DesktopUserProfile } from '../components/user/DesktopUserProfile';
import { useCourse } from '../hooks/door/useCourse';
import { useTerm } from '../hooks/door/useTerm';
import { useRequestMetadata } from '../hooks/request/useRequestMetadata';

const SelectWithoutBorder = styled(withTheme((props: SelectProps) => <Select {...props} />))(props => ({
	'&:before': {
		borderColor: 'transparent',
	},
}));

const shouldDense = () => window.innerHeight <= 1080;

export type DesktopFixedSideBarProps = {
	selectedCourse: Course | undefined;
	onSelectCourse?: (course: Course) => void;
	selectedTerm: Term | undefined;
	onSelectTerm?: (term: Term) => void;
} & BoxProps;

export const DesktopFixedSideBar: React.FC<DesktopFixedSideBarProps> = props => {
	const { selectedCourse, selectedTerm, onSelectTerm, onSelectCourse, ...boxProps } = props;

	const theme = useTheme();
	const { termList } = useTerm();
	const { courseListByTerm, courseTypeList } = useCourse();
	const courseList = selectedTerm !== undefined ? courseListByTerm(selectedTerm.id) : undefined;
	const { requestMetadataByURI } = useRequestMetadata();
	const pending = selectedTerm === undefined ? false : requestMetadataByURI(courseListURI(selectedTerm)).pending;

	const [dense, setDense] = useState(shouldDense());

	// height-responsive-sidebar
	useEffect(() => {
		const onResize = () => setDense(shouldDense());

		window.addEventListener('resize', onResize);

		return () => window.removeEventListener('resize', onResize);
	});

	return (
		<Box component="aside" {...boxProps}>
			<DesktopUserProfile />

			<DesktopSpacer vertical={2} />

			{termList.length > 0 && (
				<DesktopRoundedPaper>
					<List disablePadding>
						<ListItem style={{ paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
							<SelectWithoutBorder fullWidth value={selectedTerm?.id}>
								{termList.map((term, i) => (
									<MenuItem key={term.id} value={term.id} onClick={() => onSelectTerm?.(term)}>
										{term.name}
									</MenuItem>
								))}
							</SelectWithoutBorder>
						</ListItem>
					</List>
				</DesktopRoundedPaper>
			)}

			<DesktopSpacer vertical={2} />

			{courseList !== undefined && (
				<DesktopRoundedPaper>
					{courseList.length === 0 ? (
						<ListItem>
							{pending ? (
								<ListItemText style={{ textAlign: 'center' }}>
									<CircularProgress size={24} />
								</ListItemText>
							) : (
								<ListItemText>항목이 없습니다</ListItemText>
							)}
						</ListItem>
					) : (
						courseTypeList()
							.map(type => {
								const coursesByType = courseList.filter(course => course.type === type);

								if (coursesByType.length === 0) return undefined;

								return (
									<List
										key={type}
										subheader={
											<ListSubheader style={dense ? { height: '2.4rem' } : {}} disableSticky>
												{type}
											</ListSubheader>
										}
									>
										{coursesByType.map(course => (
											<ListItem
												key={course.id}
												button
												onClick={() => onSelectCourse?.(course)}
												style={dense ? { paddingTop: '0.1rem', paddingBottom: '0.1rem' } : {}}
											>
												<ListItemText
													primary={course.name}
													style={{
														paddingLeft: '0.8rem',

														...(selectedCourse?.id === course.id ? { color: theme.palette.primary.main } : {}),
													}}
												/>
											</ListItem>
										))}
									</List>
								);
							})
							.filter(component => component !== undefined)
					)}
				</DesktopRoundedPaper>
			)}
		</Box>
	);
};

export type DesktopSideBarProps = {
	open: boolean;
	onClose: () => void;
} & DesktopFixedSideBarProps;

export const DesktopSideBar: React.FC<DesktopSideBarProps> = props => {
	const { open, onClose, width = 220, ...sideBarProps } = props;
	const theme = useTheme();

	// drawer's mount destination
	const container = window !== undefined ? () => window.document.body : undefined;

	return (
		<nav>
			<Hidden smDown implementation="css">
				<Box width={width} marginRight="2rem">
					<DesktopFixedSideBar width={width} marginRight={3} position="fixed" {...sideBarProps} />
				</Box>
			</Hidden>

			<Hidden mdUp implementation="css">
				<Drawer
					container={container}
					variant="temporary"
					open={open}
					onClose={onClose}
					PaperProps={{ style: { background: 'transparent', boxShadow: 'none' } }}
				>
					<DesktopFixedSideBar
						width={width}
						style={{ marginTop: theme.spacing(6), marginLeft: theme.spacing(2) }}
						{...sideBarProps}
					/>
				</Drawer>
			</Hidden>
		</nav>
	);
};
