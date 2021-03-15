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
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';

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

export type SideBarProps = { selected?: Pick<ICourse, 'id' | 'termId'> } & BoxProps;

export const SideBar: React.FC<SideBarProps> = props => {
	const { selected, ...boxProps } = props;

	const theme = useTheme();
	const history = useHistory();
	const {
		terms: { terms },
		fetchTerms,
	} = useTerms();
	const { coursesByTerm, courseTypes, fetchCourses } = useCourses();
	const [selectedTermId, setSelectedTermId] = useState<ITerm['id'] | undefined>(selected?.termId);

	const handleSelectionChange = (event: React.ChangeEvent<{ value: unknown }>) => {
		const selectedTermId = event.target.value as string;

		setSelectedTermId(selectedTermId);

		const selectedTerm = terms.find(term => term.id === selectedTermId);

		if (selectedTerm !== undefined) fetchCourses(selectedTerm);
	};

	const handleSelectCourse = (course: ICourse) => {
		history.replace(`/courses/${course.id}`);
	};

	useEffect(() => {
		if (terms.length === 0) {
			fetchTerms();
		} else {
			fetchCourses(terms[0]);

			setSelectedTermId(terms[0].id);
		}
	}, [terms]);

	return (
		<Box component="aside" {...boxProps}>
			<RoundedPaper>
				<List disablePadding>
					<ListItem style={{ paddingTop: '0.2rem', paddingBottom: '0.2rem' }}>
						<SelectWithoutBorder fullWidth defaultValue={terms[0]?.id} onChange={handleSelectionChange}>
							{terms.length > 0 ? (
								terms.map((term, i) => (
									<MenuItem key={term.id} value={term.id}>
										{term.name}
									</MenuItem>
								))
							) : (
								<MenuItem value={undefined}>로딩 중 ...</MenuItem>
							)}
						</SelectWithoutBorder>
					</ListItem>
				</List>
			</RoundedPaper>

			{selectedTermId !== undefined && (
				<RoundedPaper>
					{coursesByTerm(selectedTermId).length === 0 ? (
						<ListItem>
							<ListItemText>항목이 없습니다</ListItemText>
						</ListItem>
					) : (
						courseTypes()
							.map(type => {
								const courses = coursesByTerm(selectedTermId).filter(course => course.type === type);

								if (courses.length === 0) return undefined;

								return (
									<List key={type} subheader={<ListSubheader>{type}</ListSubheader>}>
										{courses.map(course => (
											<ListItem key={course.id} button onClick={() => handleSelectCourse(course)}>
												<ListItemText
													primary={course.name}
													style={{
														paddingLeft: '0.8rem',

														...(selected?.id === course.id ? { color: theme.palette.primary.main } : {}),
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
