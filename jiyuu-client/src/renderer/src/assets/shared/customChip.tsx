import { Chip, Stack, SxProps, Theme, Typography } from "@mui/material";

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
			color="default"
			label={
				<Stack direction={"row"} alignItems={"center"} spacing={0.5}>
					{optionalIcon}
					<Typography
						variant="caption"
						sx={{
							fontSize: 10,
							lineHeight: 1.2,
							fontWeight: 600,
							letterSpacing: 0,
							textTransform: "uppercase",
						}}
					>
						{label}
					</Typography>
				</Stack>
			}
			sx={{
				height: 20,
				borderRadius: 1,
				px: 0.25,
				backdropFilter: "blur(10px)",
				"& .MuiChip-label": {
					px: 1.1,
				},
				...chipStyle,
			}}
			onClick={optionalOnClick}
		/>
	);
}
