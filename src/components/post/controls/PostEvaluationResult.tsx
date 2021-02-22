import { Grid, Typography } from '@material-ui/core';
import React from 'react';

export const PostEvaluationResult: React.FC<{
	result: { score?: number; comment?: string };
}> = props => {
	const { result } = props;

	return (
		<>
			<Grid container spacing={2} alignItems="center">
				{result.score && (
					<Grid item>
						<Typography variant="h4">{result.score}점</Typography>
					</Grid>
				)}

				{result.comment && (
					<Grid item zeroMinWidth>
						<Typography variant="body2">
							{result.comment}
						</Typography>
					</Grid>
				)}
			</Grid>
		</>
	);
};
