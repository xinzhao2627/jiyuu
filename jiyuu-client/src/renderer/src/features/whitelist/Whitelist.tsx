import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	FilledInput,
	FormControl,
	IconButton,
	InputAdornment,
	InputLabel,
	Stack,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { VisibilityOff } from "@mui/icons-material";

export default function Whitelist(): React.JSX.Element {
	const [whitelistData, setWhitelistData] = useState<string[]>([]);
	useEffect(() => {
		const listeners = [
			{
				channel: "whitelist/put/response",
				handler: (_, data: { error: string }) => {
					if (data.error) {
						toast.error("error adding a whitelist");
						console.log(data.error);
					}
				},
			},
			{
				channel: "whitelist/get/response",
				handler: (_, data: { error: string; data: string[] }) => {
					if (data.error) {
						toast.error("error fetching whitelist data");
						console.log(data.error);
					} else {
						setWhitelistData(data.data);
					}
				},
			},
			{
				channel: "whitelist/delete/response",
				handler: (_, data: { error: string }) => {
					if (data.error) {
						toast.error("error fetching whitelist data");
						console.log(data.error);
					}
				},
			},
		];
		ipcRendererSend("whitelist/get", {});
		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	return (
		<Box alignContent={"center"} width={"100%"} height={"100%"} px={20}>
			<Stack
				sx={{
					backgroundColor: "white",
					alignContent: "center",
					height: "100%",
					overflow: "auto",
				}}
			>
				<ToggleButtonGroup
					color="primary"
					exclusive
					aria-label="Platform"
					value={"on"}
				>
					<ToggleButton
						value="on"
						disableRipple
						sx={{ minWidth: 75, width: "50%" }}
					>
						URL
					</ToggleButton>
					<ToggleButton
						value="off"
						disableRipple
						sx={{ minWidth: 75, width: "50%" }}
					>
						Website Content
					</ToggleButton>
				</ToggleButtonGroup>
				<FormControl
					fullWidth
					sx={{
						p: 0,
						"& input": {
							caretColor: "black",
						},
					}}
					variant="filled"
				>
					<InputLabel htmlFor="">Whitelist item</InputLabel>
					<FilledInput
						onKeyDown={(e) => {
							const k = e.key.toLowerCase();
							if (k === "enter") {
								// TODO put into whitelist backend
								ipcRendererSend("whitelist/put", {
									whitelist_item: "hello",
									whitelist_type: "world",
									is_absolute: true,
								});
							}
						}}
					/>
				</FormControl>{" "}
				<Typography variant="caption" sx={{ m: 1 }} color="textSecondary">
					Press Enter to add a keyword or a website{" "}
					{"(e.g: facebook.com/reel | r/funny)"}
				</Typography>
				<Stack
					alignContent={"center"}
					justifyContent={"center"}
					height={"100%"}
				>
					{whitelistData.length > 0 ? (
						<>
							{whitelistData.map((v, i) => {
								<div key={`${v} - ${i}`}>{v}</div>;
							})}
						</>
					) : (
						<Typography variant="h6" color="textSecondary" textAlign={"center"}>
							The whitelist is currently empty!
						</Typography>
					)}
				</Stack>
			</Stack>
		</Box>
	);
}
