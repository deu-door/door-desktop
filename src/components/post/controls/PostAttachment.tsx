import { createStyles, Grid, IconButton, Link, makeStyles } from '@material-ui/core';
import { Attachment as AttachmentIcon, Clear, Publish } from '@material-ui/icons';
import React, { useState } from 'react';
import { Attachment } from 'service/door/interfaces';
import { downloader } from 'service/downloader';

const useStyles = makeStyles(theme => createStyles({
	postAttachment: {
		margin: theme.spacing(2, 0)
	}
}));

export type PostFileProps = {
	name: string,
	link?: string,
	deleteButton?: boolean,
	onDelete?: () => void
}

export const PostFile: React.FC<PostFileProps> = props => {
	const { name, link, deleteButton = false, onDelete } = props;

	return (
		<Grid container spacing={1}>
			<Grid item>
				<AttachmentIcon />
			</Grid>
			<Grid item>
				{link ? <Link component="button" onClick={() => downloader.download(link)}>{name}</Link> : name}
			</Grid>
			{deleteButton && <Grid item>
				<IconButton color="primary" title="삭제" size="small" onClick={() => onDelete?.()}>
					<Clear />
				</IconButton>
			</Grid>}
		</Grid>
	);
}

export type PostAttachmentProps = {
	attachments: Attachment[],
	deleteButton?: boolean
}

export const PostAttachment: React.FC<PostAttachmentProps> = props => {
	const { attachments, deleteButton = false, children } = props;
	const classes = useStyles();

	return (
		<div className={classes.postAttachment}>
			{attachments.map(attachment => (
				<PostFile
					key={attachment.link}
					name={attachment.title}
					link={attachment.link}
					deleteButton={deleteButton}
				/>
			))}

			{children}
		</div>
	);
}