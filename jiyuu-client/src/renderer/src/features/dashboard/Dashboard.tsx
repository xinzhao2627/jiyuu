/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";

import {
	Box,
	Card,
	CardActions,
	CardContent,
	CircularProgress,
	Grid,
	IconButton,
	List,
	ListItem,
	ListItemText,
	Stack,
	SxProps,
	Theme,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import TopKpi from "./components/TopKpi";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import { blue } from "@mui/material/colors";

function miniCardTime(count: number): React.JSX.Element {
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
	const [usageLogSummarized, setUsageLogSummarized] = React.useState<
		Map<string, number>
	>(new Map<string, number>());
	const [clicksSummarized, setClicksSummarized] = React.useState<
		Map<string, number>
	>(new Map<string, number>());
	const [selectedPeriod, setSelectedPeriod] = React.useState<"m" | "w" | "d">(
		"d",
	);
	// const [isKpiLoading, setIsKpiLoading] = React.useState<boolean>(false);
	const [dashboardRetrieveReady, setDashboardRetrieveReady] =
		React.useState<boolean>(true);
	function dashboardGet(initiateLoading: boolean = false): void {
		// setIsKpiLoading(initiateLoading);
		if (dashboardRetrieveReady) {
			setDashboardRetrieveReady(false);
			ipcRendererSend("dashboard/get", {});
		}
	}
	React.useEffect(() => {
		let isUnmounted = false;
		const listeners = [
			{
				channel: "dashboard/get/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error getting dashboard data: ", data.error);
					} else {
						const d = data.data as {
							usageLogSummarized: Map<string, number>;
							clicksSummarized: Map<string, number>;
						};
						setUsageLogSummarized(d.usageLogSummarized);
						setClicksSummarized(d.clicksSummarized);
						// console.log("the d: ", d);
					}

					setDashboardRetrieveReady(true);
					// setIsKpiLoading(false);
					if (!isUnmounted) {
						setTimeout(() => dashboardGet(), 1000);
					}
				},
			},
			{
				channel: "useroptions/get/response",
				handler: (_, data) => {
					if (data.error)
						console.error("error retrieving user settings", data.error);
					else {
						const d = data.data as {
							dashboardDateMode: "m" | "w" | "d" | null;
						};
						console.log("d is: ", d);

						setSelectedPeriod(d.dashboardDateMode || "d");
					}
				},
			},
			{
				channel: "useroptions/set/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("error setting user settings: ", data.error);
					}
					ipcRendererSend("useroptions/get", {});
				},
			},
		];
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});

		dashboardGet();
		ipcRendererSend("useroptions/get", {});
		return () => {
			isUnmounted = true;
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	const t1 = miniCardTime(30);
	const tButtonStyle: SxProps<Theme> = {
		backgroundColor: "white",
		p: 0.7,
		px: 1.3,
		textTransform: "none",
		"&.Mui-selected": {
			backgroundColor: "#1976d2",
			color: "white",
			"&:hover": {
				backgroundColor: "#1565c0",
			},
		},
		fontWeight: 400,
		letterSpacing: "initial",
	};
	const clicksDisplay = (): React.JSX.Element => {
		let sum = 0;
		if (clicksSummarized) {
			for (const [_k, v] of clicksSummarized.entries()) {
				sum += v;
			}
		}
		return (
			<>
				<Typography variant="h3" sx={{ color: blue[700], fontWeight: 600 }}>
					{sum}
				</Typography>
			</>
		);
	};
	const usageLogDisplay = (): React.JSX.Element => {
		let sum = 0;
		if (usageLogSummarized) {
			for (const [_k, v] of usageLogSummarized.entries()) {
				sum += v;
			}
		}
		const mode = (sum * 1.0) / 60 > 60 ? "hours" : "minutes";
		const displaySum =
			(sum * 1.0) / 60 > 60 ? (sum * 1.0) / 3600 : (sum * 1.0) / 60;
		return (
			<>
				<Typography variant="h3" sx={{ color: blue[700], fontWeight: 600 }}>
					{`${displaySum.toFixed(1)} ${mode}`}
				</Typography>
			</>
		);
	};
	const mostUsedDisplay = (): React.JSX.Element => {
		const arr = Array.from(usageLogSummarized);
		arr.sort((a, b) => {
			return b[1] - a[1];
		});

		function generateListItem(): React.JSX.Element {
			const res = arr[0] || null;
			if (res) {
				const sum = res[1];
				const mode = (sum * 1.0) / 60 > 60 ? "hours" : "minutes";
				const displaySum =
					(sum * 1.0) / 60 > 60 ? (sum * 1.0) / 3600 : (sum * 1.0) / 60;

				return (
					<Stack direction={"row"} gap={1}>
						<Typography variant="body1" color="initial">
							{res[0]}
						</Typography>
						<Typography variant="body1" color="initial">
							{displaySum.toFixed(1)} {mode}
						</Typography>
					</Stack>
				);
			}

			return <>Nothing to show!</>;
		}

		return <>{generateListItem()}</>;
	};
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "inline-block",
			}}
		>
			<Stack direction={"row"} gap={2} alignContent={"end"} textAlign={"end"}>
				<ToggleButtonGroup
					value={selectedPeriod}
					exclusive
					onChange={(
						_e: React.MouseEvent<HTMLElement>,
						newPeriod: "d" | "w" | "m" | null,
					) => {
						if (newPeriod === "d" || newPeriod == "w" || newPeriod == "m") {
							console.log("sending ipcrenderer", newPeriod);

							ipcRendererSend("useroptions/set", {
								dashboardDateMode: newPeriod,
							});
							dashboardGet(true);
						}
					}}
					sx={{
						alignContent: "center",
						textAlign: "center",
					}}
				>
					<ToggleButton
						value="d"
						aria-label="left aligned"
						disableRipple
						sx={tButtonStyle}
					>
						d
					</ToggleButton>
					<ToggleButton
						value="w"
						aria-label="centered"
						disableRipple
						sx={tButtonStyle}
					>
						w
					</ToggleButton>
					<ToggleButton
						value="m"
						aria-label="right aligned"
						disableRipple
						sx={tButtonStyle}
					>
						m
					</ToggleButton>
				</ToggleButtonGroup>
				<IconButton>
					<MoreHorizIcon />
				</IconButton>
			</Stack>
			<Grid container borderRadius={0} spacing={0.8} padding={1}>
				{/* site visits today */}
				<Grid size={4}>
					<Card
						sx={{
							minWidth: 275,
							minHeight: 130,
							padding: 0,
						}}
					>
						<CardContent>
							<Typography mb={1} variant="body1" fontWeight={400}>
								Number of websites visited{" "}
								{selectedPeriod === "d"
									? "today"
									: selectedPeriod === "m"
										? "this month"
										: "this week"}
							</Typography>
							<Stack>{clicksDisplay()}</Stack>
						</CardContent>
					</Card>
				</Grid>

				{/* time usage today */}
				<Grid size={4}>
					<Card
						sx={{
							minWidth: 275,
							padding: 0,
							minHeight: 130,
						}}
					>
						<CardContent>
							<Typography mb={1} variant="body1" fontWeight={400}>
								Total time spent{" "}
								{selectedPeriod === "d"
									? "today"
									: selectedPeriod === "m"
										? "this month"
										: "this week"}
							</Typography>
							<Stack>{usageLogDisplay()}</Stack>
						</CardContent>
					</Card>
				</Grid>
				{/* time usage today */}
				<Grid size={4}>
					<Card
						sx={{
							minWidth: 275,
							padding: 0,
							minHeight: 130,
						}}
					>
						<CardContent>
							<Typography mb={1} variant="body1" fontWeight={400}>
								Most used websites{" "}
								{selectedPeriod === "d"
									? "today"
									: selectedPeriod === "m"
										? "this month"
										: "this week"}
							</Typography>
							<Stack>{mostUsedDisplay()}</Stack>
						</CardContent>
					</Card>{" "}
				</Grid>

				{/* Total block groups active/inactive */}
				<Grid size={12}>
					<TopKpi title={"Total block groups"} content={t1} />
				</Grid>
			</Grid>
		</div>
	);
}
