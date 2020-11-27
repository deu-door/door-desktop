import { deepOrange } from "@material-ui/core/colors";
import { Description } from "@material-ui/icons";
import { Reference } from "service/door/interfaces/reference";
import { actions } from "store/modules";
import React from 'react';
import { PostTag } from "./controls/PostTag";
import { PostBase, PostBaseProps } from "./PostBase";

export type ReferencePostProps = {
	post: Reference
} & PostBaseProps

export const ReferencePost: React.FC<ReferencePostProps> = props => {
	const { post: reference, ...postProps } = props;

	return (
		<PostBase
			post={reference}
			action={actions.reference(reference.courseId, reference.id)}
			tag={<PostTag color={deepOrange[500]} icon={<Description />} name="자료" />}
			
			{...postProps}
		/>
	);
}