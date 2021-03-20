import {
	Box,
	Button,
	CircularProgress,
	Dialog,
	DialogActions,
	DialogContent,
	Divider,
	IconButton,
	Link,
	LinkProps,
	Paper,
	styled,
	TextField,
	Typography,
	TypographyProps,
	useTheme,
	withTheme,
} from '@material-ui/core';
import { Add, ArrowBack, Attachment, CheckCircleOutline, Delete, ErrorOutline } from '@material-ui/icons';
import { AsyncThunkState } from 'components/common/AsyncThunkState';
import { KeepLatestState } from 'components/common/KeepLatestState';
import { usePosts } from 'hooks/door/usePosts';
import { IAttachment, IPost, IPostHead, ISubmittablePost, PostVariant } from 'models/door';
import React, { useEffect, useState } from 'react';
import { useHistory } from 'react-router';
import { RouteComponentProps } from 'react-router-dom';
import { driver } from 'services/door/util';
import { downloader } from 'services/downloader';
import { IAsyncThunkState } from 'store/modules/util';
import { PostSubtitle } from './PostSubtitle';
import { SubmitDuration } from './SubmitDuration';

const { shell } = window.require('electron');

export const PostContents = styled(
	withTheme((props: TypographyProps) => (
		<Typography variant="body2" color="textSecondary" component="span" paragraph {...props}>
			{props.children}
		</Typography>
	)),
)(props => ({
	'& p:first-child': {
		marginTop: props.theme.spacing(0),
	},
	'& p:last-child': {
		marginBottom: props.theme.spacing(0),
	},
}));

const FetchLink = styled((props: LinkProps) => <Link component="a" {...props} />)({
	'&:hover': {
		textDecoration: 'none',
	},
	cursor: 'pointer',
});

const isFulfilledPost = (post: IPostHead): post is IPost => {
	return 'contents' in post;
};

const isSubmittablePost = (post: IPost): post is ISubmittablePost => {
	return 'submission' in post;
};

export type PostAttachmentProps = {
	attachment: Partial<IAttachment>;
};

export const PostAttachment: React.FC<PostAttachmentProps> = props => {
	const { attachment } = props;

	return (
		<Button
			variant="contained"
			color="default"
			size="small"
			startIcon={<Attachment />}
			disableElevation
			onClick={() => attachment.link !== undefined && downloader.download(attachment.link)}
		>
			{attachment.title ?? '첨부파일'}
		</Button>
	);
};

export type RoutePostDetailsProps = RouteComponentProps<{
	postVariant: PostVariant;
	postId: IPost['id'];
}>;

export const RoutePostDetails: React.FC<RoutePostDetailsProps> = props => {
	const {
		match: {
			params: { postId: id, postVariant: variant },
		},
	} = props;

	const { postById } = usePosts();
	const post = postById(variant, id);

	if (post === undefined)
		return (
			<Box>
				404 NOT FOUND for post id {variant}#{id}
			</Box>
		);

	if (isFulfilledPost(post) && isSubmittablePost(post)) return <SubmittablePostDetails post={post} />;

	return <PostDetails post={post} />;
};

export type PostDetailsProps = {
	post: IPostHead & IAsyncThunkState;
	header?: React.ReactNode;
	footer?: React.ReactNode;
};

export const PostDetails: React.FC<PostDetailsProps> = props => {
	const { post, children, header, footer } = props;
	const history = useHistory();
	const { fetchPost } = usePosts();

	const triggerFetch = () => post && fetchPost(post);

	return (
		<Box component="article">
			<Button
				disableElevation
				variant="contained"
				color="primary"
				size="small"
				startIcon={<ArrowBack />}
				onClick={() => history.goBack()}
			>
				이전으로
			</Button>

			<Box height="1rem" />

			<Typography variant="h5">{post.title}</Typography>

			<Typography variant="subtitle1">
				<PostSubtitle post={post} />
			</Typography>

			<Box height="0.3rem" />

			<KeepLatestState state={post} onTriggerFetch={triggerFetch}>
				<FetchLink onClick={triggerFetch}>
					<AsyncThunkState state={post} />
				</FetchLink>
			</KeepLatestState>

			<Box paddingY="1rem">
				<Divider />
			</Box>

			{header && (
				<>
					{header}
					<Box height="2rem" />
				</>
			)}

			{isFulfilledPost(post) && (
				<Box>
					{post.attachments.map(attachment => (
						<Box key={attachment.link} marginRight="0.5rem" marginBottom="1rem" display="inline-block">
							<PostAttachment attachment={attachment} />
						</Box>
					))}
				</Box>
			)}

			{children ??
				(isFulfilledPost(post) && (
					<PostContents
						onClick={event => {
							// find HTMLAnchorElement for iterating parents
							event.preventDefault();

							let element: HTMLElement | null = event.target as HTMLElement;
							while (element instanceof HTMLElement) {
								if (element instanceof HTMLAnchorElement) {
									console.log(`External Link clicked: ${element.href}`);
									shell.openExternal(element.href);
									break;
								}

								element = element.parentElement;
							}
						}}
						dangerouslySetInnerHTML={{ __html: post.contents }}
					/>
				))}

			{footer && (
				<>
					<Box height="2rem" />
					{footer}
				</>
			)}
		</Box>
	);
};

export type SubmittablePostDetailsProps = PostDetailsProps & {
	post: ISubmittablePost;
};

export const SubmittablePostDetails: React.FC<SubmittablePostDetailsProps> = props => {
	const { post } = props;
	const theme = useTheme();
	const { fetchPost, putSubmission } = usePosts();

	const [now, setNow] = useState(Date.now());
	const [edit, setEdit] = useState(false);
	const [contents, setContents] = useState<string | undefined>(undefined);
	const [file, setFile] = useState<File | undefined>(undefined);
	const [pending, setPending] = useState(false);
	const [openDeleteDialog, setOpenDeleteDialog] = useState(false);

	const fileInputRef = React.createRef<HTMLInputElement>();

	useEffect(() => {
		const timer = setInterval(() => setNow(Date.now()), 30000);

		return () => clearInterval(timer);
	}, []);

	const onFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		setFile(event.target.files?.[0]);
	};

	const deleteFile = async (link: string) => {
		setOpenDeleteDialog(false);

		setPending(true);

		await driver.post('/Common/FileDeleteNew', { fno: link.match(/\d+$/)?.[0] });
		await fetchPost(post);

		setPending(false);
	};

	const clear = () => {
		setContents(undefined);
		setFile(undefined);
		setEdit(false);
	};

	const submit = async () => {
		setEdit(false);
		setPending(true);

		await putSubmission({
			...post,

			form: {
				contents: contents ?? post.submission.contents,
				file: file,
			},
		});
		await fetchPost(post);

		clear();
		setPending(false);
	};

	const canEdit =
		// check for default duration
		(new Date(post.duration.from).valueOf() < now && now < new Date(post.duration.to).valueOf()) ||
		// check for additional Duration
		(post.additionalDuration !== undefined &&
			new Date(post.additionalDuration.from).valueOf() < now &&
			now < new Date(post.additionalDuration.to).valueOf());

	const editing = edit && !pending;

	return (
		<PostDetails
			header={
				<Paper elevation={0} style={{ backgroundColor: post.submitted ? theme.palette.success.main : theme.palette.warning.main }}>
					<Box padding="1rem" display="flex" justifyContent="space-between" alignItems="center" color="white">
						<Box display="inline-flex" alignItems="center">
							{post.submitted ? <CheckCircleOutline fontSize="large" /> : <ErrorOutline fontSize="large" />}
							<Box width="0.5rem" />
							<Typography>{post.submitted ? '제출 완료' : '미제출'}</Typography>
						</Box>
						<SubmitDuration duration={post.duration} additionalDuration={post.additionalDuration} />
					</Box>
				</Paper>
			}
			footer={
				<>
					<Box height="3rem" />
					<Typography variant="h5">제출</Typography>
					<Box height="1rem" />
					<TextField
						multiline
						variant="outlined"
						rows={3}
						placeholder="내용을 입력해주세요 ..."
						value={contents ?? post.submission.contents}
						onChange={event => setContents(event.target.value)}
						disabled={!editing}
						fullWidth
					/>
					<Box height="1rem" />
					<Box>
						{post.submission.attachments.map(attachment => (
							<Box key={attachment.link} marginRight="0.5rem" marginBottom="1rem" display="inline-block">
								<PostAttachment attachment={attachment} />
								{canEdit && (
									<>
										<Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
											<DialogContent>
												<strong>{attachment.title}</strong> 파일을 정말로 삭제하시겠습니까?
											</DialogContent>
											<DialogActions>
												<Button onClick={() => setOpenDeleteDialog(false)} color="primary">
													취소
												</Button>
												<Button onClick={() => deleteFile(attachment.link)} color="primary">
													삭제
												</Button>
											</DialogActions>
										</Dialog>
										<Box width="0.5rem" display="inline-block" />
										{/* TODO: IMPORTANT: add delete modal */}
										<IconButton size="small" onClick={() => setOpenDeleteDialog(true)}>
											<Delete />
										</IconButton>
									</>
								)}
							</Box>
						))}
						{edit && post.submission.attachments.length === 0 && (
							<>
								{file !== undefined && (
									<Box marginRight="0.5rem" display="inline-block">
										<PostAttachment attachment={{ title: file.name }} />
									</Box>
								)}

								<Box marginBottom="1rem" display="inline-block">
									<input type="file" onChange={onFileChange} ref={fileInputRef} hidden />

									<Button
										variant="contained"
										color="secondary"
										size="small"
										startIcon={<Add />}
										disabled={!editing}
										onClick={() => fileInputRef.current?.click()}
									>
										파일 업로드
									</Button>
								</Box>
							</>
						)}
					</Box>

					{pending ? (
						<CircularProgress />
					) : edit ? (
						<>
							<Button variant="contained" color="primary" onClick={submit}>
								제출
							</Button>
							<Box display="inline-block" width="1rem" />
							<Button variant="contained" color="default" onClick={clear}>
								취소
							</Button>
						</>
					) : (
						<>
							<Button variant="contained" color="primary" disabled={!canEdit} onClick={() => setEdit(true)}>
								편집
							</Button>
						</>
					)}
				</>
			}
			{...props}
		/>
	);
};
