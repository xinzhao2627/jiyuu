import { Box, Typography } from "@mui/material";
import * as React from "react";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

export default function BlockCounter(): React.JSX.Element {
	return (
		<Box sx={{ ...uiStyles.kpiCard, p: 2, width: "fit-content" }}>
			<Typography variant="h6" color="text.secondary">
				Total Blocks
			</Typography>
			<Typography variant="h4" color="primary.main" fontWeight={700}>
				0
			</Typography>
		</Box>
	);
}
