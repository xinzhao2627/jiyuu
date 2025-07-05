/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState } from "react";
import BlockCounter from "./components/BlockCounter";
import {
	Box,
	Grid,
	Paper,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import TopKpi from "./components/TopKpi";
import BlockIcon from "@mui/icons-material/Block";
import RemoveRedEyeIcon from "@mui/icons-material/RemoveRedEye";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import InterestsIcon from "@mui/icons-material/Interests";
import { useStore } from "../blockings/blockingsStore";

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
			<Typography variant="h3" color="initial">
				{count}
			</Typography>
		</Box>
	);
}

export default function Dashboard(): React.JSX.Element {
	const t1 = miniCardTime(30, "day");
	const { selectedPeriod, setSelectedPeriod } = useStore();
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
						title="Total site visits"
						content={t1}
						icon={<RemoveRedEyeIcon />}
					/>
				</Grid>

				{/* block count */}
				<Grid size={4}>
					<TopKpi title="Total block count" content={t1} icon={<BlockIcon />} />
				</Grid>

				{/* time usage today */}
				<Grid size={4}>
					<TopKpi
						title="Total time usage"
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
			<ToggleButtonGroup
				value={selectedPeriod}
				exclusive
				onChange={(
					e: React.MouseEvent<HTMLElement>,
					newPeriod: "1d" | "1w" | "1m" | null,
				) => {
					if (newPeriod === "1d" || newPeriod == "1w" || newPeriod == "1m") {
						setSelectedPeriod(newPeriod);
					}
				}}
				sx={{
					position: "fixed",
					top: 10,
					left: "50%",
					transform: "translateX(-50%)",
					alignContent: "center",
					textAlign: "center",
				}}
			>
				<ToggleButton
					value="1d"
					aria-label="left aligned"
					disableRipple
					sx={{
						minWidth: 50,
						textTransform: "none",
						"&.Mui-selected": {
							backgroundColor: "#1976d2",
							color: "white",
							"&:hover": {
								backgroundColor: "#1565c0",
							},
						},
					}}
				>
					1 day
				</ToggleButton>
				<ToggleButton
					value="1w"
					aria-label="centered"
					disableRipple
					sx={{
						minWidth: 50,
						textTransform: "none",
						"&.Mui-selected": {
							backgroundColor: "#1976d2",
							color: "white",
							"&:hover": {
								backgroundColor: "#1565c0",
							},
						},
					}}
				>
					1 week
				</ToggleButton>
				<ToggleButton
					value="1m"
					aria-label="right aligned"
					disableRipple
					sx={{
						minWidth: 50,
						textTransform: "none",
						"&.Mui-selected": {
							backgroundColor: "#1976d2",
							color: "white",
							"&:hover": {
								backgroundColor: "#1565c0",
							},
						},
					}}
				>
					1 month
				</ToggleButton>
			</ToggleButtonGroup>
			{/*  */}
		</div>
	);
}
