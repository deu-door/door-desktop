import { Box, Divider, Grid, Typography } from '@material-ui/core';
import { blueGrey, brown, deepPurple, green, grey, orange, pink, teal } from '@material-ui/core/colors';
import { Email, LocalPhone } from '@material-ui/icons';
import { useCourses } from 'hooks/door/useCourses';
import { ICourse, ICourseRateInfo } from 'models/door';
import React from 'react';
import { RouteComponentProps } from 'react-router-dom';

const CourseInfoSection: React.FC<{ title: string }> = ({ children, title }) => {
	return (
		<Box marginBottom="2.5rem">
			<Typography variant="subtitle1" color="textSecondary">
				{title}
			</Typography>
			<Box paddingTop="0.7rem">{children}</Box>
		</Box>
	);
};

const getRateLabel = (name: keyof ICourseRateInfo) => {
	switch (name) {
		case 'midterm':
			return ['중간고사', pink[500]];
		case 'finalterm':
			return ['기말고사', deepPurple[500]];
		case 'quiz':
			return ['퀴즈', blueGrey[500]];
		case 'assignment':
			return ['과제', orange[500]];
		case 'teamProject':
			return ['팀 프로젝트', brown[500]];
		case 'attendance':
			return ['출석', teal[500]];
		case 'etc1':
			return ['기타1', grey[400]];
		case 'etc2':
			return ['기타2', grey[500]];
		case 'etc3':
			return ['기타3', grey[600]];
		case 'presentation':
			return ['발표', green[500]];
		case 'participation':
			return ['참여도'];
	}
	return [name, grey[300]];
};

export type CourseInfoProps = RouteComponentProps<{
	courseId: ICourse['id'];
}>;

export const CourseInfo: React.FC<CourseInfoProps> = props => {
	const {
		match: {
			params: { courseId },
		},
	} = props;
	const { courseById } = useCourses();

	const course = courseById(courseId);

	if (course === undefined) return <Box>404 NOT FOUND for course {courseId}</Box>;

	return (
		<Box>
			{course.syllabus && (
				<>
					<CourseInfoSection title="교수정보">
						<Box display="flex">
							<Typography variant="h4">{course.professor}</Typography>

							<Box marginLeft="2rem">
								<Typography variant="subtitle2" color="textSecondary">
									<Box display="flex" alignItems="center">
										<LocalPhone fontSize="inherit" />
										<Box width="0.4rem" />
										<span> {course.syllabus.contact}</span>
									</Box>
								</Typography>
								<Typography variant="subtitle2" color="textSecondary">
									<Box display="flex" alignItems="center">
										<Email fontSize="inherit" />
										<Box width="0.4rem" />
										<span>{course.syllabus.email}</span>
									</Box>
								</Typography>
							</Box>
						</Box>
					</CourseInfoSection>

					<CourseInfoSection title="강의정보">
						<Grid container alignItems="baseline">
							<Grid item>
								<Typography variant="h3" display="inline">
									{course.syllabus.credits}
								</Typography>
								<Typography variant="subtitle1" display="inline">
									학점
								</Typography>
							</Grid>

							<Box width="2rem" />
							<Divider orientation="vertical" flexItem />
							<Box width="2rem" />

							<Grid item>
								<Typography variant="h3" display="inline">
									{course.syllabus.hours}
								</Typography>
								<Typography variant="subtitle1" display="inline">
									시간
								</Typography>
							</Grid>

							<Box width="2rem" />
							<Divider orientation="vertical" flexItem />
							<Box width="2rem" />

							<Grid item>
								<Typography variant="h3" display="inline">
									{course.syllabus.target}
								</Typography>
								<Typography variant="subtitle1" display="inline">
									학년
								</Typography>
							</Grid>
						</Grid>

						<Box height="1.2rem" />

						<Box display="flex" alignItems="baseline">
							<Typography variant="subtitle2" color="textSecondary">
								주관
							</Typography>
							<Box width="0.5rem" />
							<Typography variant="h6">{course.syllabus.major}</Typography>
						</Box>

						<Box display="flex" alignItems="baseline">
							<Typography variant="subtitle2" color="textSecondary">
								유형
							</Typography>
							<Box width="0.5rem" />
							<Typography variant="h6">{course.type}</Typography>
						</Box>
					</CourseInfoSection>

					<CourseInfoSection title="주교재">
						<Typography variant="h6">{course.syllabus.book || '-'}</Typography>
					</CourseInfoSection>

					<CourseInfoSection title="수업평가방법">
						<Box bgcolor="black" height="2rem" display="flex">
							{Object.entries(course.syllabus.rateInfo)
								.filter(([name, rate]) => rate > 0)
								.sort(([a, rateA], [b, rateB]) => rateB - rateA)
								.map(([name, rate]) => {
									const [displayName, color] = getRateLabel(name as keyof ICourseRateInfo);

									return (
										<Box
											key={name}
											flex={rate}
											height="100%"
											bgcolor={color}
											color="white"
											display="inline-flex"
											alignItems="center"
											paddingLeft="0.3rem"
											whiteSpace="nowrap"
											overflow="hidden"
											textOverflow="hidden"
										>
											{`${displayName} ${rate}%`}
										</Box>
									);
								})}
						</Box>
					</CourseInfoSection>

					<CourseInfoSection title="교과목개요">
						<Typography variant="body2" color="textSecondary">
							{course.syllabus.description.split('\n').map((line, i) => (
								<span key={i}>
									{line}
									<br />
								</span>
							))}
						</Typography>
					</CourseInfoSection>

					<CourseInfoSection title="교과 교육목표">
						<Typography variant="body2" color="textSecondary">
							{course.syllabus.goal.split('\n').map((line, i) => (
								<span key={i}>
									{line}
									<br />
								</span>
							))}
						</Typography>
					</CourseInfoSection>
				</>
			)}
		</Box>
	);
};
