import { Checkbox, FormControl, FormControlLabel, FormGroup, Typography } from '@material-ui/core';
import { CheckBox, CheckBoxOutlineBlank } from '@material-ui/icons';
import React, { useState } from 'react';

export type DesktopCheckboxGroupProps = {
	options: Array<{ label?: string; value: string }>;
	values?: string[];
	onChange?: (values: string[]) => void;
};

export const DesktopCheckboxGroup: React.FC<DesktopCheckboxGroupProps> = props => {
	const { options, values, onChange } = props;
	const [selectedOptions, setSelectedOptions] = useState<Set<string>>(new Set());

	return (
		<FormControl>
			<FormGroup row>
				{options.map(({ label, value }, index) => (
					<FormControlLabel
						key={value}
						style={{ marginRight: 0, marginLeft: index !== 0 ? '0.7rem' : 0 }}
						control={
							<Checkbox
								style={{ padding: 0, marginRight: '0.2rem' }}
								color="primary"
								icon={<CheckBoxOutlineBlank style={{ fontSize: '1.2rem' }} />}
								checkedIcon={<CheckBox style={{ fontSize: '1.2rem' }} />}
								checked={values?.includes(value) ?? selectedOptions.has(value)}
								onChange={event => {
									event.target.checked
										? setSelectedOptions(new Set([...(values ?? selectedOptions), value]))
										: setSelectedOptions(new Set([...(values ?? selectedOptions)].filter(_value => _value !== value)));

									onChange?.([...selectedOptions]);
								}}
							/>
						}
						label={
							<Typography
								variant="subtitle2"
								color="textSecondary"
								style={{ display: 'inline-block', verticalAlign: 'middle' }}
							>
								{label ?? value}
							</Typography>
						}
					/>
				))}
			</FormGroup>
		</FormControl>
	);
};
