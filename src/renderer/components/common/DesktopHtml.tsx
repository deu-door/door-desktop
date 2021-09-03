import { createStyles, makeStyles, Typography, TypographyProps } from '@material-ui/core';
import React from 'react';

const useStyles = makeStyles(theme =>
	createStyles({
		content: {
			'& p:first-child': {
				marginTop: 0,
			},
			'& p:last-child': {
				marginBottom: 0,
			},
		},
	}),
);

export type DesktopHtmlProps = TypographyProps & {
	content: string;
};

export const DesktopHtml: React.FC<DesktopHtmlProps> = props => {
	const { content, ...TypographyProps } = props;
	const classes = useStyles();

	const handleClick: React.MouseEventHandler<HTMLSpanElement> = event => {
		// find HTMLAnchorElement for iterating parents

		let element: HTMLElement | undefined = event.target as HTMLElement | undefined;

		const url = (() => {
			while (element instanceof HTMLElement) {
				if (element instanceof HTMLAnchorElement) {
					console.log(`External Link clicked: ${element.href}`);

					return element;
					break;
				}
				element = element.parentElement ?? undefined;
			}
			return undefined;
		})()?.getAttribute('href');

		if (typeof url === 'string') {
			event.preventDefault();
			import('electron').then(({ remote }) => {
				remote?.shell.openExternal(url);
			});
		}
	};

	return (
		<Typography
			className={classes.content}
			variant="body2"
			color="textSecondary"
			paragraph
			onClick={handleClick}
			dangerouslySetInnerHTML={{ __html: content }}
			style={{
				maxWidth: '60rem',
				overflowX: 'auto',
			}}
			{...TypographyProps}
		/>
	);
};
