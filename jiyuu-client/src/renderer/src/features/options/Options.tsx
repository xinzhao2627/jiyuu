import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";

import { useStore } from "../blockings/blockingsStore";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	Chip,
	FormControl,
	MenuItem,
	Select,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import Divider from "@mui/material/Divider";
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
	const [updateVersion, setUpdateVersion] = useState<string | null>();
	const { handleSubmit, register, reset, control } = useForm({
		defaultValues: {
			restrictDelay: 60,
			blockUnsupportedBrowser: 0,
			blockEmulators: 0,
			selectedTheme: localStorage.getItem("jiyuuThemeMode") || "light",
		},
	});
	const { blockGroup, setBlockGroupData, setConfirmDeleteModal } = useStore();
	// const [userOptions, setUserOptions] = useState<user_optionsTable | undefined>(
	// 	undefined,
	// );

	const listeners = [
		{
			// RECEIVE BLOCK GROUP RESPONSE
			channel: "blockgroup/get/response",
			handler: (_, data) => {
				if (data.error)
					console.error("Error blockgroup/get/response: ", data.error);

				setBlockGroupData(data.data);
			},
		},
		{
			channel: "configoptions/set/response",
			handler: (_, data) => {
				if (data.error) {
					console.error("Error configoptions/set/response", data.error);
					toast.error("Error configuring options, try again");
				} else {
					toast.success("Options saved");
				}
			},
		},
		{
			channel: "useroptions/get/response",
			handler: (
				_,
				data: { error: string | undefined; data: user_optionsTable },
			) => {
				if (data.error) {
					console.error("Error useroptions/get/response", data.error);
				} else {
					// setUserOptions(data.data);
					console.log("data: ", data.data);
					reset({
						restrictDelay: data.data.secondsUntilClosed || 60,
						blockUnsupportedBrowser: data.data.blockUnsupportedBrowser ?? 0,
						blockEmulators: data.data.blockEmulators ?? 0,
						selectedTheme: data.data.selectedTheme ?? "light",
					});
					const selectedTheme = data.data.selectedTheme;
					if (selectedTheme === "light" || selectedTheme === "dark") {
						window.dispatchEvent(
							new CustomEvent("jiyuu-theme-change", {
								detail: selectedTheme,
							}),
						);
					}
				}
			},
		},
		{
			channel: "openurl/response",
			handler: (_, data) => {
				if (data.error) {
					toast.error("Error opening url");
					console.log(data.error);
				}
			},
		},

		{
			channel: "check-for-update/response",
			handler: (_, data) => {
				if (data.error) {
					toast.error("Error Fetching updates: " + data.error);
					console.log(data.error);
				} else if (data.isUpdateAvailable) {
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
			handler: (_, data) => {
				if (data.error) {
					toast.error("Error downloading update: " + data.error);
					console.log(data.error);
				} else {
					setUpdateTextState("install");
				}
				setIsLoading(false);
			},
		},
		{
			channel: "install-update/response",
			handler: (_, data) => {
				if (data.error) {
					toast.error("Error installing update: " + data.error);
				} else {
					setUpdateTextState(null);
				}
				setIsLoading(false);
			},
		},
	];
	const isDisabled = blockGroup.data.some((v) => v.restriction_type);
	useEffect(() => {
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
			<Stack
				sx={uiStyles.pageInner}
				direction={{ xs: "column", md: "row" }}
				gap={3}
				alignItems="stretch"
			>
				<Box
					component="form"
					noValidate
					onSubmit={handleSubmit((fv: FieldValues) => {
						// console.log("TODO", fv);
						const secondsUntilClosed = Number(fv.restrictDelay);
						const blockUnsupportedBrowser = Number(fv.blockUnsupportedBrowser);
						const blockEmulators = Number(fv.blockEmulators);
						const selectedTheme = fv.selectedTheme;
						if (Number.isNaN(secondsUntilClosed) && secondsUntilClosed < 5) {
							toast.error("Invalid delay input: " + fv.restrictDelay);
						} else if (Number.isNaN(blockUnsupportedBrowser)) {
							toast.error("Invalid toggle option (Unsupported Browser) ");
						} else if (Number.isNaN(blockEmulators)) {
							toast.error(
								"Invalid toggle option (Block Emulators) " + blockEmulators,
							);
						} else if (selectedTheme !== "light" && selectedTheme !== "dark") {
							toast.error("Invalid option (Selected theme)" + selectedTheme);
						} else {
							ipcRendererSend("configoptions/set", {
								secondsUntilClosed: secondsUntilClosed,
								blockUnsupportedBrowser: blockUnsupportedBrowser,
								blockEmulators: blockEmulators,
								selectedTheme: selectedTheme,
							});
							if (selectedTheme === "light" || selectedTheme === "dark") {
								window.dispatchEvent(
									new CustomEvent("jiyuu-theme-change", {
										detail: selectedTheme,
									}),
								);
							}
							// reset();
						}
						// toast.success("saved");
					})}
					sx={{
						...uiStyles.sectionCard,
						p: { xs: 2, sm: 2.5 },
						display: "flex",
						flexDirection: "column",
						gap: 2.5,
						flex: 1,
						minWidth: 0,
					}}
				>
					<Box>
						<Typography variant="overline" sx={uiStyles.eyebrow}>
							Options
						</Typography>
						<Typography variant="h4" sx={uiStyles.pageTitle}>
							App settings
						</Typography>
					</Box>
					<Stack gap={1}>
						<Stack>
							<Typography variant="subtitle1" fontWeight={600}>
								Browser disable delay
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Seconds until the app terminates the browser if the extension is{" "}
								disabled or {'"'}Allow in incognito{'"'} is disabled
							</Typography>
						</Stack>
						<TextField
							type="number"
							id="restrictDelay"
							placeholder="e.g. 60 seconds"
							inputProps={{ max: 60, min: 6 }}
							{...register("restrictDelay")}
							fullWidth
						/>
					</Stack>
					<Stack gap={1}>
						<Stack>
							<Typography variant="subtitle1" fontWeight={600}>
								Block unsupported browsers
							</Typography>
							<Typography variant="body2" color="text.secondary">
								Supported browsers: Chrome {"(all chromium browsers)"}, Firefox,
								Edge, Opera, Brave, Vivaldi, Tor
							</Typography>
						</Stack>

						<Controller
							name="blockUnsupportedBrowser"
							control={control}
							// defaultValue={
							// 	typeof userOptions?.blockUnsupportedBrowser === "undefined"
							// 		? 0
							// 		: userOptions.blockUnsupportedBrowser
							// }
							render={({ field }) => (
								<ToggleButtonGroup
									color="primary"
									exclusive
									aria-label="Platform"
									value={field.value}
									onChange={(_, newValue) => {
										if (newValue !== null) {
											field.onChange(newValue);
										}
									}}
									disabled={isDisabled}
									sx={{ alignSelf: "flex-start" }}
								>
									<ToggleButton value={1} disableRipple sx={{ minWidth: 75 }}>
										On
									</ToggleButton>
									<ToggleButton value={0} disableRipple sx={{ minWidth: 75 }}>
										Off
									</ToggleButton>
								</ToggleButtonGroup>
							)}
						/>
					</Stack>{" "}
					<Stack gap={1}>
						<Stack>
							<Typography variant="subtitle1" fontWeight={600}>
								Block emulators
							</Typography>
							<Typography variant="body2" color="text.secondary">
								{"(e.g: bluestacks, mumu, nox, ldplayer, etc..)"}
							</Typography>
						</Stack>
						<Controller
							name="blockEmulators"
							control={control}
							// defaultValue={
							// 	typeof userOptions?.blockEmulators === "undefined"
							// 		? 0
							// 		: userOptions.blockEmulators
							// }
							render={({ field }) => (
								<ToggleButtonGroup
									color="primary"
									exclusive
									aria-label="Platform"
									value={field.value}
									onChange={(_, newValue) => {
										if (newValue !== null) {
											field.onChange(newValue);
										}
									}}
									disabled={isDisabled}
									sx={{ alignSelf: "flex-start" }}
								>
									<ToggleButton value={1} disableRipple sx={{ minWidth: 75 }}>
										On
									</ToggleButton>
									<ToggleButton value={0} disableRipple sx={{ minWidth: 75 }}>
										Off
									</ToggleButton>
								</ToggleButtonGroup>
							)}
						/>
					</Stack>
					<Stack gap={1}>
						<Typography variant="subtitle1" fontWeight={600}>
							Theme
						</Typography>
						<Controller
							name="selectedTheme"
							control={control}
							render={({ field }) => (
								<FormControl sx={{ maxWidth: 220 }}>
									<Select
										{...field}
										size="small"
										inputProps={{ "aria-label": "Theme" }}
									>
										<MenuItem value={"light"}>Light</MenuItem>
										<MenuItem value={"dark"}>Dark</MenuItem>
									</Select>
								</FormControl>
							)}
						/>
					</Stack>
					<Button variant="contained" color="primary" type="submit" fullWidth>
						Save
					</Button>
					<Stack sx={{ ...uiStyles.outlinedPanel, p: 2 }} gap={1}>
						<Typography variant="subtitle1" fontWeight={600}>
							Delete usage data
						</Typography>
						<Typography variant="body2" color="text.secondary">
							{
								"Delete all recorded time spent on websites from the database. (Warning, your dashboard will be emptied!)"
							}
						</Typography>
						<Button
							variant="outlined"
							color="error"
							fullWidth
							sx={{ mt: 1 }}
							onClick={() => {
								setConfirmDeleteModal(true);
							}}
						>
							Delete
						</Button>
					</Stack>
				</Box>
				<Divider
					orientation="vertical"
					flexItem
					sx={{ display: { xs: "none", md: "block" } }}
				/>
				<Stack
					sx={{
						...uiStyles.sectionCardMuted,
						p: { xs: 2, sm: 2.5 },
						flex: 1,
						minWidth: 0,
						gap: 1,
					}}
				>
					<Typography variant="h3" color="primary" sx={{ fontWeight: 700 }}>
						JIYUU
					</Typography>
					<Stack direction={"row"} gap={1} mb={2}>
						<Typography variant="subtitle2" color="initial">
							developed by:{" "}
						</Typography>
						<Typography
							variant="subtitle2"
							color="text.secondary"
							sx={{ fontWeight: 400 }}
						>
							xinzhao2627
						</Typography>
					</Stack>
					<Chip
						label={"Go to Jiyuu website"}
						style={{
							fontWeight: 500,
							width: "fit-content",
						}}
						onClick={() => {
							ipcRendererSend("openurl", { process: "default" });
						}}
						onDelete={() => {}}
						deleteIcon={<OpenInNewIcon fontSize="small" />}
						color="primary"
						variant="filled"
						size="small"
					/>
					<Typography variant="body2" color="text.secondary" my={1} mt={5}>
						Jiyuu is a desktop app, specifically used for blocking websites. It
						is an open-source project which you can publicly view at
						github.com/xinzhao2627/jiyuu. For concerns or additional feature
						suggestions, you may email me at rainnsoft@gmail.com.
					</Typography>
					<Typography variant="body2" color="text.secondary" my={1}>
						Warning: If you are using a browser that doesn{"'"}t have the Jiyuu
						Extension while a block group is active, that browser will be
						stopped after one minute {"(default)"}. So it is highly recommended
						that you install the Jiyuu OR deactivate all the block groups.
					</Typography>
					<Typography variant="body2" color="text.secondary" mt={1} mb={3}>
						If you made a mistake blocking stuff and want to forcibly uninstall
						Jiyuu, please go to the official website to download the one-click
						uninstaller script .
					</Typography>
					<Button
						size="small"
						loading={isLoading}
						variant="contained"
						sx={{
							fontWeight: 600,
							cursor: "pointer",
							width: "200px",
							justifyContent: "center",
							mb: 2,
						}}
						onClick={() => {
							setIsLoading(true);
							if (updateTextState === null || updateTextState === "no-update") {
								ipcRendererSend("check-for-update", {});
							} else if (updateTextState === "download") {
								ipcRendererSend("download-update", {});
							} else if (updateTextState === "install") {
								ipcRendererSend("install-update", {});
							}
						}}
					>
						{updateTextState === null || updateTextState === "no-update"
							? "Check for update"
							: updateTextState === "download"
								? "Download update"
								: "Restart & install"}
					</Button>
					{updateVersion && (
						<Typography variant="caption" color="success" fontWeight={600}>
							Update version: {updateVersion}
						</Typography>
					)}
					{updateTextState === "no-update" && (
						<Typography variant="caption" color="success" fontWeight={600}>
							You are currently in the latest version
						</Typography>
					)}
				</Stack>
				<DeleteUsageConfirmation />
			</Stack>
		</Box>
	);
}
