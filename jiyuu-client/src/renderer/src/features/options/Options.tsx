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
	FormHelperText,
	MenuItem,
	Select,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import Divider from "@mui/material/Divider";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
import { Controller, FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { user_optionsTable } from "@renderer/jiyuuInterfaces";
import { DeleteUsageConfirmation } from "./modals/deleteUsageConfirmation";
import { blue, green } from "@mui/material/colors";
export default function Options(): React.JSX.Element {
	const [isLoading, setIsLoading] = useState<boolean>(false);
	const [updateTextState, setUpdateTextState] = useState<
		"no-update" | "download" | "install" | null
	>(null);
	const [updateVersion, setUpdateVersion] = useState<string | null>();
	const [optionsData, setOptionsData] = useState<unknown>();
	const { handleSubmit, register, reset, control } = useForm({
		defaultValues: {
			restrictDelay: 60,
			blockUnsupportedBrowser: 0,
			blockEmulators: 0,
			selectedTheme: "light",
		},
	});
	const { blockGroup, setBlockGroupData, setConfirmDeleteModal } = useStore();
	// const [userOptions, setUserOptions] = useState<user_optionsTable | undefined>(
	// 	undefined,
	// );

	const listeners = [
		{
			// RECEIVE BLOCK GROUP RESPONSE
			channel: "options/test/response",
			handler: (_, data) => {
				if (data.error)
					console.error("Error blockgroup/get/response: ", data.error);

				setOptionsData(data.data);
			},
		},
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
		<div
			style={{
				width: "100%",
				display: "flex",
				flexDirection: "row",
				padding: "40px",
				paddingTop: "30px",
				minHeight: "100vh",
			}}
		>
			<Typography variant="body1" color="initial">
				{`${JSON.stringify(optionsData)}`}
			</Typography>
			<form
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
					} else if (!(typeof selectedTheme === "string")) {
						toast.error("Invalid option (Selected theme)" + selectedTheme);
					} else {
						ipcRendererSend("configoptions/set", {
							secondsUntilClosed: secondsUntilClosed,
							blockUnsupportedBrowser: blockUnsupportedBrowser,
							blockEmulators: blockEmulators,
							selectedTheme: selectedTheme,
						});
						// reset();
					}
					// toast.success("saved");
				})}
				style={{
					display: "flex",
					flexDirection: "column",
					flexWrap: "wrap",
					width: "50%",
					gap: "2em",
					overflow: "auto",
				}}
			>
				<Stack gap={1}>
					<Stack>
						<Typography variant="body1" color="initial">
							Browser disable delay
						</Typography>
						<Typography variant="caption" color="initial">
							Seconds until the app terminates the browser if the extension is{" "}
							<br />
							disabled or {'"'}Allow in incognito{'"'} is disabled
						</Typography>
					</Stack>
					<Box sx={{ ...modalTextFieldStyle }}>
						<input
							type="number"
							// defaultValue={userOptions?.secondsUntilClosed || 60}
							id="restrictDelay"
							placeholder="e.g 60 - seconds"
							max={60}
							min={6}
							{...register("restrictDelay")}
						/>
					</Box>
				</Stack>
				<Stack gap={1}>
					<Stack>
						<Typography variant="body1" color="initial">
							Block unsupported browsers
						</Typography>
						<Typography variant="caption" color="initial">
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
						<Typography variant="body1" color="initial">
							Block emulators
						</Typography>
						<Typography variant="caption" color="initial">
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
				<Stack>
					<Typography variant="body1" color="initial">
						Select Theme {"Coming soon!"}
					</Typography>
					<Controller
						name="selectedTheme"
						control={control}
						render={({ field }) => (
							<FormControl sx={{ minWidth: 70 }}>
								<Select
									{...field}
									displayEmpty
									inputProps={{ "aria-label": "Without label" }}
								>
									{/* <MenuItem value={"dark"}>Dark</MenuItem> */}
									<MenuItem value={"light"}>Light</MenuItem>
								</Select>
								<FormHelperText>Without label</FormHelperText>
							</FormControl>
						)}
					/>
				</Stack>
				<Button variant="contained" color="primary" type="submit" fullWidth>
					Save
				</Button>
				<Stack>
					<Typography variant="body1" color="initial" fontWeight={600}>
						Delete usage data
					</Typography>
					<Typography variant="caption" color="initial">
						{
							"Delete all recorded time spent on websites from the database. (Warning, your dashboard will be emptied!)"
						}
					</Typography>
					<Button
						variant="outlined"
						color="error"
						fullWidth
						style={{ marginTop: 12 }}
						onClick={() => {
							setConfirmDeleteModal(true);
						}}
					>
						Delete
					</Button>
				</Stack>
			</form>
			<Divider orientation="vertical" flexItem sx={{ mx: 2 }} />{" "}
			<Stack
				sx={{
					display: "flex",
					flexDirection: "column",
					flexWrap: "wrap",
					width: "50%",
					height: "100%",
					gap: 0,
				}}
			>
				<Typography
					variant="h2"
					color="initial"
					sx={{ fontWeight: 600, color: green[900] }}
				>
					JIYUU
				</Typography>
				<Stack direction={"row"} gap={1} mb={2}>
					<Typography variant="subtitle2" color="initial">
						developed by:{" "}
					</Typography>
					<Typography
						variant="subtitle2"
						color="initial"
						sx={{ fontWeight: 400 }}
					>
						xinzhao2627
					</Typography>
				</Stack>
				<Chip
					label={"Go to Jiyuu website"}
					style={{
						padding: 4,
						fontWeight: 500,
						width: "fit-content",
						backgroundColor: blue[700],
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
				<Typography
					variant="body2"
					color="initial"
					my={1}
					mt={5}
					textAlign={"justify"}
				>
					Jiyuu is a desktop app, specifically used for blocking websites. It is
					an open-source project which you can publicly view at
					github.com/xinzhao2627/jiyuu. For concerns or additional feature
					suggestions, you may email me at rainnsoft@gmail.com.
				</Typography>
				<Typography
					variant="body2"
					color="initial"
					my={3}
					textAlign={"justify"}
				>
					Warning: If you are using a browser that doesn{"'"}t have the Jiyuu
					Extension while a block group is active, that browser will be stopped
					after one minute. So it is highly recommended that you install the
					Jiyuu OR deactivate all the block groups.
				</Typography>
				<Button
					size="small"
					loading={isLoading}
					variant="contained"
					sx={{
						fontWeight: 600,
						cursor: "pointer",
						width: "200px",
						textAlign: "left",
						alignItems: "flex-start",
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
		</div>
	);
}
