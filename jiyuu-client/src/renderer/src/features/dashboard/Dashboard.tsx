/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState } from "react";
import BlockCounter from "./components/BlockCounter";
import { Grid, Paper } from "@mui/material";
import TopKpi from "./components/TopKpi";

export default function Dashboard(): React.JSX.Element {
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "inline-block",
			}}
		>
			<Grid container spacing={1} padding={1}>
				{/* site visits today */}
				<Grid size={4}>
					<TopKpi title="Site visits" content={"23"} />
				</Grid>

				{/* block count */}
				<Grid size={4}>
					<TopKpi title="Block count" content={"23"} />
				</Grid>

				{/* time usage today */}
				<Grid size={4}>
					<TopKpi title="Time usage" content={"23"} />
				</Grid>

				{/* Total block groups active/inactive */}
				<Grid size={12}>
					<TopKpi title="Total block groups" content={"23"} />
				</Grid>
			</Grid>
			{/* <BlockCounter /> */}

			{/*  */}
		</div>
	);
}
