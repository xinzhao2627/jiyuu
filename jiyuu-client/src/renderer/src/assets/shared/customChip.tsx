import { Stack, Typography, Chip, SxProps } from "@mui/material";
import { Theme } from "@emotion/react";

export function CustomChip(props: {
	optionalIcon: React.JSX.Element | undefined;
	label: string | undefined;
	chipStyle: SxProps<Theme>;
	optionalOnClick: React.MouseEventHandler<HTMLDivElement> | undefined;
}): React.JSX.Element {
	const { optionalIcon, label, chipStyle, optionalOnClick } = props;
	return (
		<Chip
			size="small"
			variant="outlined"
			clickable={Boolean(optionalOnClick)}
			label={
				<Stack direction={"row"} alignItems={"center"} spacing={0.5}>
					{optionalIcon}
					<Typography
						variant="caption"
						sx={{
							fontSize: "12px",
							lineHeight: 1.2,
						}}
					>
						{label}
					</Typography>
				</Stack>
			}
			sx={chipStyle}
			onClick={optionalOnClick}
		/>
	);
}
