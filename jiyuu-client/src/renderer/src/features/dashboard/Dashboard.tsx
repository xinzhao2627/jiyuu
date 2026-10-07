import * as React from "react";
import {
	Box,
	Card,
	CardContent,
	Grid,
	LinearProgress,
	Stack,
	SxProps,
	Theme,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import { alpha } from "@mui/material/styles";
import { uiStyles } from "@renderer/assets/shared/uiStyles";
import TopKpi from "./components/TopKpi";

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
	const [selectedPeriod, setSelectedPeriod] = React.useState<"d" | "w" | "m">(
		"d",
	);
	const [isKpiLoading, setIsKpiLoading] = React.useState<boolean>(false);

	function dashboardGet(): void {
		setIsKpiLoading(true);
		ipcRendererSend("dashboard/get", {});
	}

	React.useEffect(() => {
		const listeners = [
			{
				channel: "dashboard/get/response",
				handler: (
					_: unknown,
					data: {
						error?: unknown;
						data: {
							usageLogSummarized: Map<string, number> | null;
							clicksSummarized: Map<string, number> | null;
							groupTimeSummarized: Map<
								number,
								{ name: string; secondsElapsed: number }
							> | null;
						};
					},
				) => {
					if (data.error) {
						console.error("Error getting dashboard data: ", data.error);
					} else {
						const d = data.data;
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
					}
					setIsKpiLoading(false);
				},
			},
			{
				channel: "useroptions/get/response",
				handler: (
					_: unknown,
					data: {
						error?: unknown;
						data: { dashboardDateMode: "m" | "w" | "d" | null };
					},
				) => {
					if (!data.error && data.data?.dashboardDateMode) {
						setSelectedPeriod(data.data.dashboardDateMode);
					}
				},
			},
			{
				channel: "useroptions/set/response",
				handler: (_: unknown, data: { error?: unknown }) => {
					if (data.error) {
						console.error("Error setting user settings: ", data.error);
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
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);

	const tButtonStyle: SxProps<Theme> = {
		width: { xs: 72, sm: 84 },
		height: 32,
		textTransform: "none",
		fontSize: "0.8125rem",
		fontWeight: 600,
		"&.Mui-selected": {
			backgroundColor: "primary.main",
			color: "primary.contrastText",
			"&:hover": {
				backgroundColor: "primary.dark",
			},
		},
		borderColor: "divider",
	};

	const totalClicks = React.useMemo(() => {
		let sum = 0;
		for (const count of clicksSummarized.values()) {
			sum += count;
		}
		return sum;
	}, [clicksSummarized]);

	const totalUsageFormatted = React.useMemo(() => {
		let sumSeconds = 0;
		for (const seconds of usageLogSummarized.values()) {
			sumSeconds += seconds;
		}
		const inHours = sumSeconds >= 3600;
		const displayValue = inHours ? sumSeconds / 3600 : sumSeconds / 60;
		return `${displayValue.toFixed(1)} ${inHours ? "hrs" : "mins"}`;
	}, [usageLogSummarized]);

	const mostUsedSite = React.useMemo(() => {
		const sorted = Array.from(usageLogSummarized.entries()).sort(
			(a, b) => b[1] - a[1],
		);
		if (sorted.length === 0) return null;
		const [site, seconds] = sorted[0];
		const inHours = seconds >= 3600;
		const displayValue = inHours ? seconds / 3600 : seconds / 60;
		return {
			site,
			time: `${displayValue.toFixed(1)} ${inHours ? "hrs" : "mins"}`,
		};
	}, [usageLogSummarized]);

	const topSitesList = React.useMemo(() => {
		const sorted = Array.from(usageLogSummarized.entries()).sort(
			(a, b) => b[1] - a[1],
		);
		const totalSeconds = sorted.reduce((acc, curr) => acc + curr[1], 0);
		return sorted.slice(0, 10).map(([site, seconds]) => {
			const inHours = seconds >= 3600;
			const displayValue = inHours ? seconds / 3600 : seconds / 60;
			const percentage =
				totalSeconds > 0 ? Math.round((seconds / totalSeconds) * 100) : 0;
			return {
				site,
				duration: `${displayValue.toFixed(1)} ${inHours ? "hrs" : "mins"}`,
				percentage,
			};
		});
	}, [usageLogSummarized]);

	const groupTimeList = React.useMemo(() => {
		const list = Array.from(groupTimeSummarized.values()).filter(
			(v) => v.name && v.secondsElapsed > 0,
		);
		const total = list.reduce((acc, curr) => acc + curr.secondsElapsed, 0);
		return { list, total };
	}, [groupTimeSummarized]);

	return (
		<Box sx={uiStyles.pageShell}>
			<Stack sx={uiStyles.pageInner} spacing={2.5}>
				<Stack
					direction="row"
					alignItems="center"
					justifyContent="space-between"
					gap={2}
				>
					<Box>
						<Typography variant="overline" sx={uiStyles.eyebrow}>
							Analytics
						</Typography>
						<Typography variant="h4" sx={uiStyles.pageTitle}>
							Focus Activity
						</Typography>
					</Box>
					<ToggleButtonGroup
						value={selectedPeriod}
						exclusive
						size="small"
						disabled={isKpiLoading}
						onChange={(_e, newPeriod: "d" | "w" | "m" | null) => {
							if (newPeriod && newPeriod !== selectedPeriod) {
								setSelectedPeriod(newPeriod);
								ipcRendererSend("useroptions/set", {
									dashboardDateMode: newPeriod,
								});
								dashboardGet();
							}
						}}
					>
						<ToggleButton value="d" disableRipple sx={tButtonStyle}>
							Day
						</ToggleButton>
						<ToggleButton value="w" disableRipple sx={tButtonStyle}>
							Week
						</ToggleButton>
						<ToggleButton value="m" disableRipple sx={tButtonStyle}>
							Month
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>

				<Grid container spacing={2}>
					<Grid size={{ xs: 12, sm: 4 }}>
						<TopKpi
							label="Sites Visited"
							value={
								<Typography variant="h4" color="primary.main" fontWeight={700}>
									{totalClicks}
								</Typography>
							}
							caption={`Navigations this ${selectedPeriod === "d" ? "day" : selectedPeriod === "w" ? "week" : "month"}`}
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 4 }}>
						<TopKpi
							label="Total Time Spent"
							value={
								<Typography variant="h4" color="primary.main" fontWeight={700}>
									{totalUsageFormatted}
								</Typography>
							}
							caption="Cumulative browsing duration"
						/>
					</Grid>

					<Grid size={{ xs: 12, sm: 4 }}>
						<TopKpi
							label="Top Destination"
							value={
								mostUsedSite ? (
									<Box>
										<Typography
											variant="h6"
											fontWeight={700}
											color="primary.main"
											noWrap
										>
											{mostUsedSite.site}
										</Typography>
										<Typography
											variant="caption"
											color="text.secondary"
											fontWeight={500}
										>
											{mostUsedSite.time}
										</Typography>
									</Box>
								) : (
									<Typography variant="body2" color="text.secondary">
										No activity recorded
									</Typography>
								)
							}
						/>
					</Grid>

					<Grid size={12}>
						<Card sx={uiStyles.sectionCard}>
							<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
								<Typography variant="subtitle2" fontWeight={700} mb={1.5}>
									Block Group Distribution
								</Typography>
								{groupTimeList.list.length === 0 ? (
									<Typography
										variant="body2"
										color="text.secondary"
										py={2}
										textAlign="center"
									>
										No group session logs recorded for this period.
									</Typography>
								) : (
									<Stack spacing={1.5}>
										{groupTimeList.list.map((group) => {
											const percentage =
												groupTimeList.total > 0
													? (group.secondsElapsed / groupTimeList.total) * 100
													: 0;
											return (
												<Box key={`group-${group.name}`}>
													<Stack
														direction="row"
														justifyContent="space-between"
														alignItems="center"
														mb={0.5}
													>
														<Typography variant="body2" fontWeight={600}>
															{group.name}
														</Typography>
														<Typography
															variant="caption"
															color="text.secondary"
														>
															{group.secondsElapsed >= 3600
																? `${(group.secondsElapsed / 3600).toFixed(1)} hrs`
																: `${Math.round(group.secondsElapsed / 60)} mins`}
														</Typography>
													</Stack>
													<LinearProgress
														variant="determinate"
														value={percentage}
														sx={{
															height: 4,
															borderRadius: "2px",
															backgroundColor: (theme) =>
																alpha(theme.palette.primary.main, 0.12),
														}}
													/>
												</Box>
											);
										})}
									</Stack>
								)}
							</CardContent>
						</Card>
					</Grid>

					<Grid size={12}>
						<Card sx={uiStyles.sectionCard}>
							<CardContent sx={{ p: 2, "&:last-child": { pb: 2 } }}>
								<Typography variant="subtitle2" fontWeight={700} mb={1.5}>
									Top Visited Websites
								</Typography>
								{topSitesList.length === 0 ? (
									<Typography
										variant="body2"
										color="text.secondary"
										py={2}
										textAlign="center"
									>
										No website activity recorded for this period.
									</Typography>
								) : (
									<Stack spacing={0.75}>
										{topSitesList.map((entry, idx) => (
											<Stack
												key={`top-${entry.site}`}
												direction="row"
												alignItems="center"
												justifyContent="space-between"
												px={1.5}
												py={1}
												sx={{
													borderRadius: "4px",
													border: "1px solid",
													borderColor: "divider",
													backgroundColor: "background.paper",
												}}
											>
												<Stack
													direction="row"
													alignItems="center"
													gap={1.25}
													minWidth={0}
												>
													<Typography
														variant="caption"
														fontWeight={700}
														color="text.secondary"
														sx={{ width: 18 }}
													>
														{idx + 1}
													</Typography>
													<Typography variant="body2" fontWeight={600} noWrap>
														{entry.site}
													</Typography>
												</Stack>
												<Stack direction="row" alignItems="center" gap={2}>
													<Typography variant="caption" color="text.secondary">
														{entry.duration}
													</Typography>
													<Typography
														variant="caption"
														fontWeight={700}
														sx={{ width: 34, textAlign: "right" }}
													>
														{entry.percentage}%
													</Typography>
												</Stack>
											</Stack>
										))}
									</Stack>
								)}
							</CardContent>
						</Card>
					</Grid>
				</Grid>
			</Stack>
		</Box>
	);
}
