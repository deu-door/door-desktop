import { deepOrange } from "@material-ui/core/colors";
import { Description } from "@material-ui/icons";
import { Reference } from "service/door/interfaces/reference";
import { actions } from "store/modules";
import { PostComponent, PostComponentProps, PostTag } from "./PostComponent";
import React from 'react';

export const ReferenceComponent: React.FC<Omit<PostComponentProps, 'post'> & { reference: Reference }> = props => {
	const { reference, ...postProps } = props;

	return (
		<PostComponent
			post={reference}
			action={actions.reference(reference.courseId, reference.id)}
			tag={<PostTag color={deepOrange[500]} icon={<Description />} name="자료" />}
			{...postProps}
		/>
	);
}