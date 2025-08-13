import Typography from "@mui/material/Typography";
import Button from "@mui/material/Button";
import { useEffect, useState } from "react";
import { useStore } from "../blockings/blockingsStore";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import { Box, Switch } from "@mui/material";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
import { FieldValues, useForm } from "react-hook-form";
import toast from "react-hot-toast";
export default function Options(): React.JSX.Element {
	const { handleSubmit, register, reset } = useForm();
	const [hasRestriction, setHasRestriction] = useState<boolean>(false);
	const isDisabled = (is_on: boolean): boolean => hasRestriction && is_on;
	const { blockGroup, setBlockGroupData } = useStore();
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
				display: "inline-block",
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
					flexWrap: "wrap",
					width: "fit-content",
				}}
			>
				<Typography variant="body1" color="initial">
					Seconds until the app terminates the browser if the extension is
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
				<Typography variant="body1" color="initial">
					Block unsupported browsers
				</Typography>
				<Switch
					disabled={isDisabled(true)}
					{...register("blockUnsupportedBrowsers")}
				/>
				{/* <Typography variant="caption" color="initial">
				Currently supports chrome, edge, firefox, brave
			</Typography>
			<Switch disabled={isDisabled(true)} /> */}

				<Typography variant="body1" color="initial">
					Prevent access to task manager if there is an active block
				</Typography>
				<Switch
					disabled={isDisabled(true)}
					{...register("preventAccessTaskManager")}
				/>

				<Typography variant="body1" color="initial">
					Prevent access to date/calendar if there is an active block
				</Typography>
				<Switch
					disabled={isDisabled(true)}
					{...register("preventAccessCalendar")}
				/>

				<Button variant="text" color="primary" type="submit">
					Save
				</Button>
			</form>
		</div>
	);
}
