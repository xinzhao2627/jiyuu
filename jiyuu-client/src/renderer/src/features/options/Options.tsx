import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import SystemUpdateAltIcon from "@mui/icons-material/SystemUpdateAlt";

import { useStore } from "../blockings/blockingsStore";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	Card,
	CardContent,
	FormControl,
	InputAdornment,
	MenuItem,
	Select,
	Stack,
	Switch,
	TextField,
} from "@mui/material";
import { Controller, FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { user_optionsTable } from "@renderer/jiyuuInterfaces";
import { DeleteUsageConfirmation } from "./modals/deleteUsageConfirmation";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

export default function Options(): React.JSX.Element {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [updateTextState, setUpdateTextState] = useState<
		"no-update" | "download" | "install" | null
	>(null);
	const [updateVersion, setUpdateVersion] = useState<string | null>(null);

	const { handleSubmit, register, reset, control } = useForm({
		defaultValues: {
			restrictDelay: 60,
			blockUnsupportedBrowser: 0,
			blockEmulators: 0,
			selectedTheme: localStorage.getItem("jiyuuThemeMode") || "light",
		},
	});

	const { blockGroup, setBlockGroupData, setConfirmDeleteModal } = useStore();
	const isDisabled = blockGroup.data.some((v) => v.restriction_type);

	useEffect(() => {
		const listeners = [
			{
				channel: "blockgroup/get/response",
				handler: (
					_: unknown,
					data: { error?: unknown; data: typeof blockGroup.data },
				) => {
					if (!data.error) setBlockGroupData(data.data);
				},
			},
			{
				channel: "configoptions/set/response",
				handler: (_: unknown, data: { error?: unknown }) => {
					if (data.error) {
						toast.error("Failed to save settings");
					} else {
						toast.success("Settings saved");
					}
				},
			},
			{
				channel: "useroptions/get/response",
				handler: (
					_: unknown,
					data: { error?: unknown; data: user_optionsTable },
				) => {
					if (!data.error && data.data) {
						reset({
							restrictDelay: data.data.secondsUntilClosed || 60,
							blockUnsupportedBrowser: data.data.blockUnsupportedBrowser ?? 0,
							blockEmulators: data.data.blockEmulators ?? 0,
							selectedTheme: data.data.selectedTheme ?? "light",
						});
						const theme = data.data.selectedTheme;
						if (theme === "light" || theme === "dark") {
							window.dispatchEvent(
								new CustomEvent("jiyuu-theme-change", { detail: theme }),
							);
						}
					}
				},
			},
			{
				channel: "check-for-update/response",
				handler: (
					_: unknown,
					data: {
						error?: string;
						isUpdateAvailable?: boolean;
						updateInfo?: { version: string };
					},
				) => {
					if (data.error) {
						toast.error("Failed to check for updates: " + data.error);
					} else if (data.isUpdateAvailable && data.updateInfo) {
						setUpdateTextState("download");
						setUpdateVersion(data.updateInfo.version);
					} else {
						setUpdateTextState("no-update");
					}
					setIsLoading(false);
				},
			},
			{
				channel: "download-update/response",
				handler: (_: unknown, data: { error?: string }) => {
					if (data.error) {
						toast.error("Update download failed: " + data.error);
					} else {
						setUpdateTextState("install");
					}
					setIsLoading(false);
				},
			},
			{
				channel: "install-update/response",
				handler: (_: unknown, data: { error?: string }) => {
					if (data.error) {
						toast.error("Update installation failed: " + data.error);
					} else {
						setUpdateTextState(null);
					}
					setIsLoading(false);
				},
			},
		];

		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});

		ipcRendererSend("blockgroup/get", { init: true });
		ipcRendererSend("useroptions/get", {});

		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);

	return (
		<Box sx={uiStyles.pageShell}>
			<Stack sx={uiStyles.pageInner} spacing={2.5}>
				<Box>
					<Typography variant="overline" sx={uiStyles.eyebrow}>
						Preferences
					</Typography>
					<Typography variant="h4" sx={uiStyles.pageTitle}>
						App Settings
					</Typography>
				</Box>

				<Stack spacing={2.5}>
					<Card sx={uiStyles.sectionCard}>
						<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
							<Box
								component="form"
								noValidate
								onSubmit={handleSubmit((fv: FieldValues) => {
									const secondsUntilClosed = Number(fv.restrictDelay);
									const blockUnsupportedBrowser = Number(
										fv.blockUnsupportedBrowser,
									);
									const blockEmulators = Number(fv.blockEmulators);
									const selectedTheme = fv.selectedTheme;

									if (
										Number.isNaN(secondsUntilClosed) ||
										secondsUntilClosed < 5
									) {
										toast.error("Delay must be at least 5 seconds");
										return;
									}

									ipcRendererSend("configoptions/set", {
										secondsUntilClosed,
										blockUnsupportedBrowser,
										blockEmulators,
										selectedTheme,
									});

									if (selectedTheme === "light" || selectedTheme === "dark") {
										window.dispatchEvent(
											new CustomEvent("jiyuu-theme-change", {
												detail: selectedTheme,
											}),
										);
									}
								})}
							>
								<Stack spacing={2.5}>
									<Stack
										direction={{ xs: "column", sm: "row" }}
										justifyContent="space-between"
										alignItems={{ xs: "flex-start", sm: "center" }}
										gap={1}
									>
										<Box>
											<Typography variant="subtitle2" fontWeight={600}>
												Browser Termination Delay
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Grace period before terminating unsupported or
												non-extension browsers.
											</Typography>
										</Box>
										<TextField
											type="number"
											size="small"
											inputProps={{ max: 60, min: 5 }}
											{...register("restrictDelay")}
											InputProps={{
												endAdornment: (
													<InputAdornment position="end">sec</InputAdornment>
												),
											}}
											sx={{ width: { xs: "100%", sm: 130 } }}
										/>
									</Stack>

									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										gap={2}
									>
										<Box>
											<Typography variant="subtitle2" fontWeight={600}>
												Block Unsupported Browsers
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Restricts browsers lacking the Jiyuu security extension.
											</Typography>
										</Box>
										<Controller
											name="blockUnsupportedBrowser"
											control={control}
											render={({ field }) => (
												<Switch
													checked={Boolean(field.value)}
													disabled={isDisabled}
													onChange={(e) =>
														field.onChange(e.target.checked ? 1 : 0)
													}
												/>
											)}
										/>
									</Stack>

									<Stack
										direction="row"
										justifyContent="space-between"
										alignItems="center"
										gap={2}
									>
										<Box>
											<Typography variant="subtitle2" fontWeight={600}>
												Block Android Emulators
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Detects and restricts processes like BlueStacks, Nox,
												and LDPlayer.
											</Typography>
										</Box>
										<Controller
											name="blockEmulators"
											control={control}
											render={({ field }) => (
												<Switch
													checked={Boolean(field.value)}
													disabled={isDisabled}
													onChange={(e) =>
														field.onChange(e.target.checked ? 1 : 0)
													}
												/>
											)}
										/>
									</Stack>

									<Stack
										direction={{ xs: "column", sm: "row" }}
										justifyContent="space-between"
										alignItems={{ xs: "flex-start", sm: "center" }}
										gap={1}
									>
										<Box>
											<Typography variant="subtitle2" fontWeight={600}>
												Interface Theme
											</Typography>
											<Typography variant="caption" color="text.secondary">
												Choose between light and dark palette mode.
											</Typography>
										</Box>
										<Controller
											name="selectedTheme"
											control={control}
											render={({ field }) => (
												<FormControl
													size="small"
													sx={{ width: { xs: "100%", sm: 130 } }}
												>
													<Select {...field}>
														<MenuItem value="light">Light</MenuItem>
														<MenuItem value="dark">Dark</MenuItem>
													</Select>
												</FormControl>
											)}
										/>
									</Stack>

									<Box sx={{ pt: 1 }}>
										<Button
											variant="contained"
											color="primary"
											type="submit"
											sx={{ minWidth: 120, height: 36 }}
										>
											Save Settings
										</Button>
									</Box>
								</Stack>
							</Box>
						</CardContent>
					</Card>

					<Card sx={uiStyles.sectionCard}>
						<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
							<Stack spacing={2}>
								<Stack
									direction={{ xs: "column", sm: "row" }}
									justifyContent="space-between"
									alignItems={{ xs: "flex-start", sm: "center" }}
									gap={2}
								>
									<Box>
										<Typography variant="subtitle2" fontWeight={600}>
											Jiyuu Desktop
										</Typography>
										<Typography variant="caption" color="text.secondary">
											Open-source website restrictor. Maintained by xinzhao2627.
										</Typography>
									</Box>
									<Button
										variant="outlined"
										size="small"
										endIcon={<OpenInNewIcon fontSize="small" />}
										onClick={() => {
											ipcRendererSend("openurl", { process: "default" });
										}}
										sx={{ height: 32 }}
									>
										Visit Website
									</Button>
								</Stack>

								<Stack
									direction={{ xs: "column", sm: "row" }}
									justifyContent="space-between"
									alignItems={{ xs: "flex-start", sm: "center" }}
									gap={2}
									pt={1}
									borderTop="1px solid"
									borderColor="divider"
								>
									<Box>
										<Typography variant="subtitle2" fontWeight={600}>
											Software Updates
										</Typography>
										<Typography variant="caption" color="text.secondary">
											{updateVersion
												? `Update available: v${updateVersion}`
												: updateTextState === "no-update"
													? "You are running the latest version."
													: "Check for new releases and patches."}
										</Typography>
									</Box>
									<Button
										size="small"
										variant="contained"
										startIcon={<SystemUpdateAltIcon fontSize="small" />}
										loading={isLoading}
										onClick={() => {
											setIsLoading(true);
											if (!updateTextState || updateTextState === "no-update") {
												ipcRendererSend("check-for-update", {});
											} else if (updateTextState === "download") {
												ipcRendererSend("download-update", {});
											} else if (updateTextState === "install") {
												ipcRendererSend("install-update", {});
											}
										}}
										sx={{ height: 32 }}
									>
										{!updateTextState || updateTextState === "no-update"
											? "Check Updates"
											: updateTextState === "download"
												? "Download"
												: "Restart & Install"}
									</Button>
								</Stack>
							</Stack>
						</CardContent>
					</Card>

					<Card sx={{ ...uiStyles.sectionCard, borderColor: "error.light" }}>
						<CardContent sx={{ p: { xs: 2, sm: 2.5 } }}>
							<Stack
								direction={{ xs: "column", sm: "row" }}
								justifyContent="space-between"
								alignItems={{ xs: "flex-start", sm: "center" }}
								gap={2}
							>
								<Box>
									<Typography
										variant="subtitle2"
										fontWeight={600}
										color="error.main"
									>
										Danger Zone: Purge Usage Analytics
									</Typography>
									<Typography variant="caption" color="text.secondary">
										Permanently clears recorded browsing history and time
										analytics.
									</Typography>
								</Box>
								<Button
									variant="outlined"
									color="error"
									size="small"
									sx={{ height: 32 }}
									onClick={() => setConfirmDeleteModal(true)}
								>
									Delete Data
								</Button>
							</Stack>
						</CardContent>
					</Card>
				</Stack>

				<DeleteUsageConfirmation />
			</Stack>
		</Box>
	);
}
