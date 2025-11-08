import * as React from "react";

import {
	Box,
	Card,
	CardContent,
	Grid,
	Stack,
	SxProps,
	Theme,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
	LinearProgress,
} from "@mui/material";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import { blue } from "@mui/material/colors";

export default function Dashboard(): React.JSX.Element {
	const [usageLogSummarized, setUsageLogSummarized] = React.useState<
		Map<string, number>
	>(new Map<string, number>());
	const [clicksSummarized, setClicksSummarized] = React.useState<
		Map<string, number>
	>(new Map<string, number>());
	const [groupTimeSummarized, setGroupTimeSummarized] = React.useState<
		Map<number, { name: string; secondsElapsed: number }>
	>(new Map<number, { name: string; secondsElapsed: number }>());
	const [selectedPeriod, setSelectedPeriod] = React.useState<"m" | "w" | "d">(
		"d",
	);
	// const [isKpiLoading, setIsKpiLoading] = React.useState<boolean>(false);
	const [dashboardRetrieveReady, setDashboardRetrieveReady] =
		React.useState<boolean>(true);
	function dashboardGet(): void {
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
							usageLogSummarized: Map<string, number> | null;
							clicksSummarized: Map<string, number> | null;
							groupTimeSummarized: Map<
								number,
								{ name: string; secondsElapsed: number }
							> | null;
						};
						setUsageLogSummarized(
							d.usageLogSummarized || new Map<string, number>(),
						);
						setClicksSummarized(
							d.clicksSummarized || new Map<string, number>(),
						);

						setGroupTimeSummarized(
							d.groupTimeSummarized ||
								new Map<number, { name: string; secondsElapsed: number }>(),
						);
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
	const tButtonStyle: SxProps<Theme> = {
		backgroundColor: "white",
		width: 100,
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
			for (const v of clicksSummarized.values()) {
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
			for (const v of usageLogSummarized.values()) {
				sum += v;
			}
		}
		const mode = (sum * 1.0) / 60 > 60 ? "hrs" : "mins";
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
				const sum = res[1] ?? 200;
				const mode = (sum * 1.0) / 60 > 60 ? "hrs" : "mins";
				const displaySum =
					(sum * 1.0) / 60 > 60 ? (sum * 1.0) / 3600 : (sum * 1.0) / 60;

				return (
					<Stack alignContent={"center"} mt={1}>
						<Typography
							variant="h5"
							alignContent={"center"}
							sx={{ color: blue[700] }}
							width={"100%"}
							overflow={"hidden"}
							textOverflow={"ellipsis"}
						>
							{res[0]}
						</Typography>
						<Typography
							variant="subtitle1"
							sx={{ color: blue[700], fontWeight: 600 }}
						>
							{displaySum.toFixed(1)} {mode}
						</Typography>
					</Stack>
				);
			}

			return (
				<Stack
					sx={{
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Typography
						mt={1}
						variant="h4"
						sx={{ fontWeight: 200 }}
						color="textSecondary"
					>
						Data unavailable
					</Typography>
				</Stack>
			);
		}

		return <>{generateListItem()}</>;
	};
	const blockGroupsTimeDisplay = (): React.JSX.Element => {
		const groupsListArr: Array<{ name: string; secondsElapsed: number }> = [];
		let totalsec = 0;
		for (const v of groupTimeSummarized.entries()) {
			const id = v[0];
			const group_name = v[1].name;
			const secondsElapsed = v[1].secondsElapsed;

			if (id && secondsElapsed && group_name) {
				groupsListArr.push({
					name: group_name,
					secondsElapsed: secondsElapsed,
				});
				totalsec += secondsElapsed;
			}
		}
		if (groupsListArr.length === 0)
			return (
				<Stack
					sx={{
						height: "100%",
						display: "flex",
						alignItems: "center",
						justifyContent: "center",
					}}
				>
					<Typography
						mt={2.5}
						variant="h4"
						sx={{ fontWeight: 200 }}
						color="textSecondary"
					>
						Data unavailable
					</Typography>
				</Stack>
			);
		// TODO hgow??

		return (
			<>
				{groupsListArr.map((v, i) => {
					return (
						<Box key={`group-${v.name}-${i}`} sx={{ mb: 2 }}>
							<Stack
								direction={"row"}
								justifyContent={"space-between"}
								mb={0.1}
							>
								<Typography variant="subtitle1">{v.name}</Typography>
								<Typography variant="subtitle2" color="initial">
									{v.secondsElapsed > 3600
										? `${(v.secondsElapsed / 3600.0).toFixed(1)} hours`
										: `${(v.secondsElapsed / 60.0).toFixed(1)} minutes`}
								</Typography>
							</Stack>

							<LinearProgress
								variant="determinate"
								value={totalsec > 0 ? (v.secondsElapsed / totalsec) * 100 : 0}
								sx={{ height: 8, borderRadius: 1 }}
							/>
						</Box>
					);
				})}
			</>
		);
	};
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "inline-block",
			}}
		>
			<Stack
				direction={"row"}
				alignContent={"center"}
				textAlign={"center"}
				justifyContent={"center"}
				p={1}
			>
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
							dashboardGet();
						}
					}}
					sx={{
						alignContent: "center",
						textAlign: "center",
						border: "0.5px solid #CBCBCB",
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
			</Stack>
			<Grid container borderRadius={0} spacing={0.8} padding={1}>
				{/* site visits today */}
				<Grid size={{ xs: 12, sm: 6, md: 4 }}>
					<Card
						sx={{
							minWidth: 275,
							minHeight: 130,
							padding: 0,
							height: 130,
						}}
					>
						<CardContent>
							<Typography mb={1} variant="body1" fontWeight={400}>
								Sites visited{" "}
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

				{/* time spent today */}
				<Grid size={{ xs: 12, sm: 6, md: 4 }}>
					<Card
						sx={{
							minWidth: 275,
							padding: 0,
							minHeight: 130,
							height: 130,
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
				<Grid size={{ xs: 12, sm: 6, md: 4 }}>
					<Card
						sx={{
							minWidth: 275,
							padding: 0,
							minHeight: 130,
						}}
					>
						<CardContent sx={{ height: "100%" }}>
							<Typography mb={1} variant="body1" fontWeight={400}>
								Most used site{" "}
								{selectedPeriod === "d"
									? "today"
									: selectedPeriod === "m"
										? "this month"
										: "this week"}
							</Typography>
							<Box height={"100%"}>{mostUsedDisplay()}</Box>
						</CardContent>
					</Card>{" "}
				</Grid>

				{/* Total block groups active/inactive */}
				<Grid size={12}>
					<Card
						sx={{
							padding: 0,
						}}
					>
						<CardContent>
							<Typography mb={1} variant="body1" fontWeight={400}>
								Block group time usage{" "}
							</Typography>
							<Box padding={1}>{blockGroupsTimeDisplay()}</Box>
						</CardContent>
					</Card>{" "}
				</Grid>
			</Grid>
		</div>
	);
}
