/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState } from "react";
import BlockCounter from "./components/BlockCounter";
import { Box, Grid, Paper } from "@mui/material";
import TopKpi from "./components/TopKpi";
import BlockIcon from "@mui/icons-material/Block";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InterestsIcon from "@mui/icons-material/Interests";

function miniCardTime(
	count: number,
	mode: "day" | "hour" | "min",
): React.JSX.Element {
	return (
		<Box
			sx={{
				display: "flex",
			}}
		>
			{count} in the last 24hrs
		</Box>
	);
}

export default function Dashboard(): React.JSX.Element {
	const t1 = miniCardTime(30, "day");
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
					<TopKpi
						title="Site visits"
						content={t1}
						icon={<RemoveRedEyeIcon />}
					/>
				</Grid>

				{/* block count */}
				<Grid size={4}>
					<TopKpi title="Block count" content={t1} icon={<BlockIcon />} />
				</Grid>

				{/* time usage today */}
				<Grid size={4}>
					<TopKpi
						title="Time usage"
						content={t1}
						icon={
							<AccessTimeIcon sx={{ alignContent: "center", height: "100%" }} />
						}
					/>
				</Grid>

				{/* Total block groups active/inactive */}
				<Grid size={12}>
					<TopKpi
						title="Total block groups"
						content={t1}
						icon={<InterestsIcon />}
					/>
				</Grid>
			</Grid>
			{/* <BlockCounter /> */}

			{/*  */}
		</div>
	);
}
