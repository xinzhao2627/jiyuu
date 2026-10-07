import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import * as React from "react";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

interface TopKpiProps {
	label: string;
	value: React.ReactNode;
	caption?: string;
}

export default function TopKpi({
	label,
	value,
	caption,
}: TopKpiProps): React.JSX.Element {
	return (
		<Card sx={uiStyles.kpiCard}>
			<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
				<Typography
					variant="overline"
					sx={{
						color: "text.secondary",
						fontWeight: 700,
						letterSpacing: "0.06em",
						fontSize: "0.7rem",
						display: "block",
					}}
				>
					{label}
				</Typography>
				<Box sx={{ mt: 0.75, mb: caption ? 0.5 : 0 }}>{value}</Box>
				{caption ? (
					<Typography variant="caption" color="text.secondary">
						{caption}
					</Typography>
				) : null}
			</CardContent>
		</Card>
	);
}
