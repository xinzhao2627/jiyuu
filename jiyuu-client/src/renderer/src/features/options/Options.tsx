import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useStore } from "../blockings/blockingsStore";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	FormControl,
	FormHelperText,
	MenuItem,
	Select,
	SelectChangeEvent,
	Stack,
	Switch,
} from "@mui/material";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
import { FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
export default function Options(): React.JSX.Element {
	const { handleSubmit, register, reset } = useForm();
	const [hasRestriction, setHasRestriction] = useState<boolean>(false);
	const isDisabled = (is_on: boolean): boolean => hasRestriction && is_on;
	const { blockGroup, setBlockGroupData } = useStore();

	const [selectedTheme, setSelectedTheme] = useState<string>("");

	const handleChange = (event: SelectChangeEvent): void => {
		setSelectedTheme(event.target.value);
	};
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
	];
	useEffect(() => {
		setSelectedTheme("light");
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});

		new Promise((res) => {
			ipcRendererSend("blockgroup/get", { init: true });
			res(true);
		}).then(() => {
			for (const bgd of blockGroup.data) {
				if (bgd.restriction_type) {
					setHasRestriction(true);
				}
			}
		});

		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				paddingLeft: 50,
				paddingRight: 50,
				display: "inline-block",
			}}
		>
			<div
				style={{
					height: "100%",
					width: "100%",
					padding: 50,
					display: "inline-block",
					backgroundColor: "white",
					border: "1px solid #e5e5e5",
				}}
			>
				<form
					noValidate
					onSubmit={handleSubmit((fv: FieldValues) => {
						console.log("TODO", fv.preventAccessCalendar);
						toast.success("saved");
						reset();
					})}
					style={{
						display: "flex",
						flexDirection: "column",
						flexWrap: "wrap",
						width: "fit-content",
						gap: "2em",
					}}
				>
					<Stack>
						<Typography variant="body1" color="initial">
							Seconds until the app terminates the browser if the extension is{" "}
							<br />
							disabled or {'"'}Allow in incognito{'"'} is disabled
						</Typography>
						<Box sx={{ ...modalTextFieldStyle }}>
							<input
								type="number"
								id="restrictDelay"
								placeholder="e.g 60 - seconds"
								max={60}
								min={1}
								{...register("restrictDelay")}
							/>
						</Box>
					</Stack>
					<Stack>
						<Stack>
							<Typography variant="body1" color="initial">
								Block unsupported browsers
							</Typography>
							<Typography variant="subtitle2" color="initial">
								Supported browsers
							</Typography>
						</Stack>

						<Switch
							disabled={isDisabled(true)}
							{...register("blockUnsupportedBrowsers")}
						/>
					</Stack>{" "}
					<Stack>
						<Stack>
							<Typography variant="body1" color="initial">
								Block emulators
							</Typography>
							<Typography variant="subtitle2" color="initial">
								{"(e.g: bluestacks, mumu, nox, ldplayer, etc..)"}
							</Typography>
						</Stack>

						<Switch
							disabled={isDisabled(true)}
							{...register("blockEmulators")}
						/>
					</Stack>
					<Stack>
						<Typography variant="body1" color="initial">
							Select Theme
						</Typography>
						<FormControl sx={{ minWidth: 120 }}>
							<Select
								value={selectedTheme}
								defaultValue="light"
								onChange={handleChange}
								displayEmpty
								inputProps={{ "aria-label": "Without label" }}
							>
								<MenuItem value={"dark"}>Dark</MenuItem>
								<MenuItem value={"light"}>Light</MenuItem>
							</Select>
							<FormHelperText>Without label</FormHelperText>
						</FormControl>
					</Stack>
					<Button variant="text" color="primary" type="submit">
						Save
					</Button>
				</form>
			</div>
		</div>
	);
}
