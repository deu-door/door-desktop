import {
	Box,
	BoxProps,
	List,
	ListItem,
	ListItemText,
	ListSubheader,
	MenuItem,
	Paper,
	PaperProps,
	Select,
	SelectProps,
	styled,
	useTheme,
	withTheme,
} from '@material-ui/core';
import { useCourses } from 'hooks/door/useCourses';
import { useTerms } from 'hooks/door/useTerms';
import { ICourse, ITerm } from 'models/door';
import React, { useEffect } from 'react';

const RoundedPaper = styled(withTheme((props: PaperProps) => <Paper elevation={0} {...props} />))(props => ({
	borderRadius: 16,
	paddingTop: props.theme.spacing(0.8),
	paddingBottom: props.theme.spacing(0.8),

	'&:not(:first-child)': {
		marginTop: props.theme.spacing(1.5),
	},
}));

const SelectWithoutBorder = styled(withTheme((props: SelectProps) => <Select {...props} />))(props => ({
	'&:before': {
		borderColor: 'transparent',
	},
}));

export type SideBarProps = {
	selectedCourse?: Pick<ICourse, 'id' | 'termId'>;
	onSelectCourse?: (course: Pick<ICourse, 'id' | 'termId'>) => void;

	selectedTerm: Pick<ITerm, 'id'>;
	onSelectTerm?: (term: Pick<ITerm, 'id'>) => void;
} & BoxProps;

export const SideBar: React.FC<SideBarProps> = props => {
	const { selectedCourse, selectedTerm, onSelectTerm, onSelectCourse, ...boxProps } = props;

	const theme = useTheme();
	const { allTerms } = useTerms();
	const { coursesByTerm, courseTypes } = useCourses();

	const terms = allTerms();

	return (
		<Box component="aside" {...boxProps}>
			{terms.length > 0 && (
				<RoundedPaper>
					<List disablePadding>
						<ListItem style={{ paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
							<SelectWithoutBorder fullWidth value={selectedTerm.id}>
								{terms.map((term, i) => (
									<MenuItem key={term.id} value={term.id} onClick={() => onSelectTerm?.(term)}>
										{term.name}
									</MenuItem>
								))}
							</SelectWithoutBorder>
						</ListItem>
					</List>
				</RoundedPaper>
			)}

			{selectedTerm !== undefined && (
				<RoundedPaper>
					{coursesByTerm(selectedTerm.id).length === 0 ? (
						<ListItem>
							<ListItemText>항목이 없습니다</ListItemText>
						</ListItem>
					) : (
						courseTypes()
							.map(type => {
								const courses = coursesByTerm(selectedTerm.id).filter(course => course.type === type);

								if (courses.length === 0) return undefined;

								return (
									<List key={type} subheader={<ListSubheader disableSticky>{type}</ListSubheader>}>
										{courses.map(course => (
											<ListItem key={course.id} button onClick={() => onSelectCourse?.(course)}>
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
				</RoundedPaper>
			)}
		</Box>
	);
};
