import { createStyles, Grid, makeStyles, Paper, PaperProps, Typography } from '@material-ui/core';
import clsx from 'clsx';
import React from 'react';

const useStyles = makeStyles(theme => createStyles({
	postTag: {
		padding: theme.spacing(0.5, 1),
		margin: theme.spacing(0, 0, 0, -1.5),
		background: theme.palette.primary.main,
		color: theme.palette.primary.contrastText,
		display: 'inline-block'
	}
}));

export const PostTag: React.FC<PaperProps & { name?: string, color: string, icon: React.ReactElement }> = props => {
	const classes = useStyles();
	const { name, icon, children, className, color, ...paperProps } = props;

	return (
		<Paper
			style={{ background: color }}
			className={clsx(classes.postTag, className)}
			elevation={4}
			{...paperProps}
		>
			{children ? children :
				<Grid container direction="column" alignItems="center">
					<Grid item>
						{icon}
					</Grid>
					<Grid item>
						<Typography variant="subtitle2" color="inherit">{name}</Typography>
					</Grid>
				</Grid>
			}
		</Paper>
	);
}