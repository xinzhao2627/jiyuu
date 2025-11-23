import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect } from "react";
import { useStore } from "../blockings/blockingsStore";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	FormControl,
	FormHelperText,
	MenuItem,
	Select,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
} from "@mui/material";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
import { Controller, FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
import { user_optionsTable } from "@renderer/jiyuuInterfaces";
import { DeleteUsageConfirmation } from "./modals/deleteUsageConfirmation";
export default function Options(): React.JSX.Element {
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
		<div>
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
					width: "fit-content",
					gap: "2em",
					height: "100%",
					padding: 50,
					overflow: "auto",
				}}
			>
				<Stack gap={1}>
					<Button
						size="small"
						variant="outlined"
						sx={{
							fontWeight: 600,
							cursor: "pointer",
							width: "200px",
							textAlign: "left",
							alignItems: "flex-start",
							mb: 2,
						}}
						onClick={() => {
							ipcRendererSend("openurl", { process: "default" });
						}}
					>
						Go to Jiyuu Website
					</Button>
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
			<DeleteUsageConfirmation />
		</div>
	);
}
