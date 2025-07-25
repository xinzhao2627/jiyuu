import { Typography } from "@mui/material";
import * as React from "react";

export default function BlockCounter(): React.JSX.Element {
	return (
		<div
			style={{
				border: "1px solid black",
				padding: "20px",
				width: "fit-content",
			}}
		>
			<Typography variant="h3" color="initial">
				Total Blocks
			</Typography>
			<p>Number of blocks: 0</p>
		</div>
	);
}
