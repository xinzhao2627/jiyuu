/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState } from "react";
import BlockCounter from "./components/BlockCounter";
import { Grid, Paper } from "@mui/material";

export default function Dashboard(): React.JSX.Element {
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				alignContent: "center",
				display: "inline-block",
			}}
		>
			<Grid container spacing={2}>
				<Grid>
					<Paper>hiu</Paper>
				</Grid>
			</Grid>
			<BlockCounter />

			{/*  */}
		</div>
	);
}
