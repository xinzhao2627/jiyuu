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
	CircularProgress,
} from "@mui/material";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import { alpha } from "@mui/material/styles";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

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
	const [isKpiLoading, setIsKpiLoading] = React.useState<boolean>(false);
	// const [dashboardRetrieveReady, setDashboardRetrieveReady] =
	// 	React.useState<boolean>(true);
	function dashboardGet(): void {
		setIsKpiLoading(true);
		// if (dashboardRetrieveReady) {
		// setDashboardRetrieveReady(false);
		ipcRendererSend("dashboard/get", {});
		// }
	}
	React.useEffect(() => {
		// let isUnmounted = false;
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
					// UPDATE 2/25/2026: NO LONGER FETCHES THE DASHBOARD EVERY SECONDS TO PREVENT PERFORMANCE DEGREDATION
					// setDashboardRetrieveReady(true);
					setIsKpiLoading(false);

					// if (!isUnmounted) {
					// 	setTimeout(() => dashboardGet(), 1000);
					// }
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
			// isUnmounted = true;
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	const tButtonStyle: SxProps<Theme> = {
		width: { xs: 88, sm: 112 },
		height: 40,
		px: 1.5,
		textTransform: "none",
		"&.Mui-selected": {
			backgroundColor: "primary.main",
			color: "primary.contrastText",
			"&:hover": {
				backgroundColor: "primary.dark",
			},
		},
		fontWeight: 600,
		letterSpacing: 0,
		borderColor: "divider",
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
				<Typography
					variant="h3"
					sx={{ color: "primary.main", fontWeight: 700 }}
				>
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
				<Typography
					variant="h3"
					sx={{ color: "primary.main", fontWeight: 700 }}
				>
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
							sx={{
								color: "primary.main",
								fontWeight: 700,
								whiteSpace: "nowrap",
							}}
							width={"100%"}
							overflow={"hidden"}
							textOverflow={"ellipsis"}
						>
							{res[0]}
						</Typography>
						<Typography
							variant="subtitle1"
							sx={{ color: "text.secondary", fontWeight: 600 }}
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
						variant="body1"
						sx={{ fontWeight: 500 }}
						color="text.secondary"
					>
						Data unavailable
					</Typography>
				</Stack>
			);
		}

		return <>{generateListItem()}</>;
	};
	const mostUsedTopTenDisplay = (): React.JSX.Element => {
		const arr = Array.from(usageLogSummarized);
		arr.sort((a, b) => b[1] - a[1]);

		const totalSeconds = arr.reduce((total, entry) => total + entry[1], 0);
		const topEntries = arr.slice(0, Math.min(10, arr.length));

		if (topEntries.length === 0) {
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
						variant="body1"
						sx={{ fontWeight: 500 }}
						color="text.secondary"
					>
						Data unavailable
					</Typography>
				</Stack>
			);
		}

		return (
			<Stack spacing={1.25} mt={1}>
				{topEntries.map((entry, index) => {
					const sum = entry[1] ?? 0;
					const mode = sum / 60 > 60 ? "hrs" : "mins";
					const displaySum = sum / 60 > 60 ? sum / 3600 : sum / 60;
					const percentage = totalSeconds > 0 ? (sum / totalSeconds) * 100 : 0;

					return (
						<Stack
							key={`top-site-${entry[0]}-${index}`}
							direction="row"
							alignItems="center"
							justifyContent="space-between"
							gap={2}
							px={1.5}
							py={1.25}
							sx={{
								borderRadius: 2,
								boxShadow: "0 6px 18px rgba(15, 23, 42, 0.04)",
								transition:
									"background-color 0.2s ease, border-color 0.2s ease, transform 0.2s ease",
							}}
						>
							<Stack sx={{ minWidth: 0 }}>
								<Typography variant="subtitle1" fontWeight={600} noWrap>
									{index + 1}. {entry[0]}
								</Typography>
								<Typography variant="caption" color="text.secondary">
									{displaySum.toFixed(1)} {mode}
								</Typography>
							</Stack>
							<Typography
								variant="body2"
								color="text.secondary"
								fontWeight={600}
							>
								{Math.round(percentage)}%
							</Typography>
						</Stack>
					);
				})}
			</Stack>
		);
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
						variant="body1"
						sx={{ fontWeight: 500 }}
						color="text.secondary"
					>
						Data unavailable
					</Typography>
				</Stack>
			);

		return (
			<>
				{groupsListArr.map((v, i) => {
					return (
						<Box key={`group-${v.name}-${i}`} sx={{ mb: 2 }}>
							<Stack
								direction={"row"}
								justifyContent={"space-between"}
								mb={0.75}
								gap={2}
							>
								<Typography variant="subtitle1" fontWeight={600}>
									{v.name}
								</Typography>
								<Typography variant="subtitle2" color="text.secondary">
									{v.secondsElapsed > 3600
										? `${(v.secondsElapsed / 3600.0).toFixed(1)} hours`
										: `${(v.secondsElapsed / 60.0).toFixed(1)} minutes`}
								</Typography>
							</Stack>

							<LinearProgress
								variant="determinate"
								value={totalsec > 0 ? (v.secondsElapsed / totalsec) * 100 : 0}
								sx={{
									height: 8,
									borderRadius: 1,
									backgroundColor: (theme) =>
										alpha(theme.palette.primary.main, 0.1),
								}}
							/>
						</Box>
					);
				})}
			</>
		);
	};
	return (
		<Box sx={uiStyles.pageShell}>
			<Stack sx={uiStyles.pageInner} spacing={2.5}>
				<Stack
					direction={{ xs: "column", sm: "row" }}
					alignItems={{ xs: "stretch", sm: "center" }}
					justifyContent="space-between"
					gap={2}
				>
					<Box>
						<Typography variant="overline" sx={uiStyles.eyebrow}>
							Dashboard
						</Typography>
						<Typography variant="h4" sx={uiStyles.pageTitle}>
							Focus activity
						</Typography>
					</Box>
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
					>
						<ToggleButton
							value="d"
							disabled={isKpiLoading}
							aria-label="left aligned"
							disableRipple
							sx={tButtonStyle}
						>
							{isKpiLoading ? (
								<CircularProgress
									size={"24px"}
									sx={{
										color:
											selectedPeriod == "d"
												? "primary.contrastText"
												: "primary.main",
									}}
								/>
							) : (
								"Day"
							)}
						</ToggleButton>
						<ToggleButton
							value="w"
							disabled={isKpiLoading}
							aria-label="centered"
							disableRipple
							sx={tButtonStyle}
						>
							{isKpiLoading ? (
								<CircularProgress
									size={"24px"}
									sx={{
										color:
											selectedPeriod == "w"
												? "primary.contrastText"
												: "primary.main",
									}}
								/>
							) : (
								"Week"
							)}
						</ToggleButton>
						<ToggleButton
							value="m"
							disabled={isKpiLoading}
							aria-label="right aligned"
							disableRipple
							sx={tButtonStyle}
						>
							{isKpiLoading ? (
								<CircularProgress
									size={"24px"}
									sx={{
										color:
											selectedPeriod == "m"
												? "primary.contrastText"
												: "primary.main",
									}}
								/>
							) : (
								"Month"
							)}
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
				<Grid container spacing={2}>
					{/* site visits today */}
					<Grid size={{ xs: 12, sm: 6, md: 4 }}>
						<Card
							sx={{
								...uiStyles.kpiCard,
								minHeight: 144,
							}}
						>
							<CardContent>
								<Typography
									mb={1}
									variant="body2"
									color="text.secondary"
									fontWeight={600}
								>
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
								...uiStyles.kpiCard,
								minHeight: 144,
							}}
						>
							<CardContent>
								<Typography
									mb={1}
									variant="body2"
									color="text.secondary"
									fontWeight={600}
								>
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
								...uiStyles.kpiCard,
								minHeight: 144,
							}}
						>
							<CardContent sx={{ height: "100%" }}>
								<Typography
									mb={1}
									variant="body2"
									color="text.secondary"
									fontWeight={600}
								>
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
								...uiStyles.sectionCard,
							}}
						>
							<CardContent>
								<Typography mb={2} variant="h6">
									Block group time usage{" "}
								</Typography>
								<Box>{blockGroupsTimeDisplay()}</Box>
							</CardContent>
						</Card>{" "}
					</Grid>

					{/* Top used sites */}
					<Grid size={12}>
						<Card
							sx={{
								...uiStyles.sectionCard,
							}}
						>
							<CardContent>
								<Typography mb={2} variant="h6">
									Top used websites
								</Typography>
								<Box>{mostUsedTopTenDisplay()}</Box>
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Stack>
		</Box>
	);
}
