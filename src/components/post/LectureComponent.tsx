import { Button, ButtonProps, CardContent, CardMedia, createStyles, Grid, makeStyles } from '@material-ui/core';
import { purple } from '@material-ui/core/colors';
import { OndemandVideo } from '@material-ui/icons';
import React, { useEffect, useState } from 'react';
import { Lecture } from 'service/door/interfaces/lecture';
import { PostAttachment, PostComponent, PostComponentProps, PostContent, PostTag } from './PostComponent';
import VisibilitySensor from 'react-visibility-sensor';
import { downloader } from 'service/downloader';
import { doorAxios } from 'service/door/util';

const useStyles = makeStyles(theme => createStyles({
	lectureOverlay: {
		width: '100%',
		height: '100%',
		background: '#E3E3E3'
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

	return (
		<PostComponent
			post={lecture}
			tag={<PostTag color={purple[500]} icon={<OndemandVideo />} name="강의" />}
			{...postProps}
		>
			<VisibilitySensor onChange={isVisible => isVisible && setLazyLoad(true)}>
				<>
					{lecture.link && linkType === 'html' &&
						<CardMedia>
							<ResponsiveDiv>
								{show ? <iframe
										title={lecture.title}
										src={lecture.link}
										width="100%"
										height="100%"
										allowFullScreen
										frameBorder="0"
									/>
									: <LectureOverlay
										onClick={onOpenLecture}
									/>}
							</ResponsiveDiv>
						</CardMedia>}

					<CardContent>
						{lecture.contents && <PostContent contents={lecture.contents} />}

						{lecture.link && linkType === 'downloadable' &&
							<PostAttachment attachment={{
								title: '첨부파일',
								link: lecture.link
							}} />}
					</CardContent>
				</>
			</VisibilitySensor>
		</PostComponent>
	);
}
