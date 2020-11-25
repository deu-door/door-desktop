import { Button, ButtonProps, CardContent, CardMedia, createStyles, Grid, makeStyles } from '@material-ui/core';
import { purple } from '@material-ui/core/colors';
import { OndemandVideo } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { Lecture, LecturesByWeek } from 'service/door/interfaces/lecture';
import { PostComponent, PostComponentProps, PostContent } from './PostComponent';
import VisibilitySensor from 'react-visibility-sensor';
import { downloader } from 'service/downloader';
import { doorAxios } from 'service/door/util';
import { PostTag } from './controls/PostTag';
import { PostAttachment } from './controls/PostAttachment';
import { actions, RootState } from 'store/modules';
import { FetchControl } from 'components/fetchable/FetchControl';
import { useSelector } from 'react-redux';
import { CourseState } from 'store/modules/courses';

const useStyles = makeStyles(theme => createStyles({
	lectureOverlay: {
		width: '100%',
		height: '100%',
		backgroundColor: 'rgba(0, 0, 0, 0.7)',
		position: 'absolute',
		top: 0, bottom: 0, left: 0, right: 0
	}
}));

const ResponsiveDiv: React.FC = props => {
	const { children } = props;

	return (
		<div style={{ width: '100%', height: '0', paddingBottom: '56.25%', position: 'relative' }}>
			<div style={{ position: 'absolute', top: 0, right: 0, bottom: 0, left: 0 }}>
				{children}
			</div>
		</div>
	);
}

const LectureOverlay: React.FC<ButtonProps> = props => {
	const { ...buttonProps } = props;
	const classes = useStyles();

	return (
		<Grid container alignItems="center" justify="center" className={classes.lectureOverlay}>
			<Grid item>
				<Button variant="contained" color="primary" {...buttonProps}>강의 시청</Button>
			</Grid>
		</Grid>
	);
}

export const LectureComponent: React.FC<Omit<PostComponentProps, 'post'> & { lecture: Lecture }> = props => {
	const { lecture, ...postProps } = props;

	type LinkType = 'downloadable' | 'html' | 'not-clear';
	const [linkType, setLinkType] = useState<LinkType>('not-clear');

	const [lazyLoad, setLazyLoad] = useState(false);
	const [show, setShow] = useState(false);

	useEffect(() => {
		const fetch = async () => {
			if(await downloader.isDownloadable(lecture.link)) {
				setLinkType('downloadable');
			}else{
				setLinkType('html');
			}
		};

		lazyLoad && fetch();
	}, [lazyLoad, lecture.link]);

	const onOpenLecture = () => {
		setShow(true);

		if(lecture.historyLink?.method) {
			doorAxios({
				url: lecture.historyLink.url,
				method: lecture.historyLink.method,
				data: lecture.historyLink.data
			});
		}
	};

	const lecturesByWeek = useSelector<RootState, LecturesByWeek>(state => state.courses.items[lecture.courseId].lectures.items[lecture.week]);

	return (
		<PostComponent
			post={lecture}
			tag={<PostTag color={purple[500]} icon={<OndemandVideo />} name="강의" />}
			fetchControl={<FetchControl fetchable={lecturesByWeek} action={actions.lectureByWeek(lecturesByWeek.courseId, lecturesByWeek.id)} />}

			{...postProps}
		>
			<VisibilitySensor onChange={isVisible => isVisible && setLazyLoad(true)}>
				<>
					{lecture.link && linkType === 'html' &&
						<CardMedia>
							<ResponsiveDiv>
								{!show && <LectureOverlay onClick={onOpenLecture} />}
								{show && <iframe
									title={lecture.title}
									src={lecture.link}
									width="100%"
									height="100%"
									allowFullScreen
									frameBorder="0"
								/>}
							</ResponsiveDiv>
						</CardMedia>}

					<CardContent>
						{lecture.contents && <PostContent contents={lecture.contents} />}

						{lecture.link && linkType === 'downloadable' &&
							<PostAttachment attachments={[{
								title: '첨부파일',
								link: lecture.link
							}]} />}
					</CardContent>
				</>
			</VisibilitySensor>
		</PostComponent>
	);
}
