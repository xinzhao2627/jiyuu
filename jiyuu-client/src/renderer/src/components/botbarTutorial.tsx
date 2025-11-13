import { Button, Stack, Typography } from "@mui/material";
import { JSX, useEffect, useState } from "react";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import toast from "react-hot-toast";
import {
	ipcRendererOn,
	ipcRendererSend,
} from "@renderer/features/blockings/blockingAPI";

export function BotbarTutorial(): JSX.Element {
	const [isTutOpen, setIsTutOpen] = useState<boolean>(false);
	useEffect(() => {
		const listeners = [
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
		const val = localStorage.getItem("isTutOpen") === "true";
		setIsTutOpen(val);
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);
	if (isTutOpen) return <></>;

	return (
		<Stack
			direction={"row"}
			sx={{
				backgroundColor: "#134686",
				color: "white",
				p: 1,
				alignContent: "center",
				alignItems: "center",
				justifyContent: "space-between",
			}}
		>
			<Typography sx={{ fontSize: 15, p: 0 }}>
				New to jiyuu? head to the tutorial 🎉 🎉
			</Typography>
			<Stack direction={"row"} gap={1.5} justifyContent={"end"}>
				<Button
					variant="text"
					size="small"
					style={{
						fontSize: 12,
						padding: 4,
						paddingLeft: 10,
						paddingRight: 10,
						color: "white",
						borderColor: "white",
					}}
				>
					Close & don&apos;t show again
				</Button>
				<Button
					variant="contained"
					size="small"
					style={{
						fontSize: 12,
						padding: 4,
						paddingLeft: 10,
						paddingRight: 10,
						backgroundColor: "white",
						color: "#134686",
					}}
					endIcon={<OpenInNewIcon fontSize="small" />}
					onClick={() => {
						ipcRendererSend("openurl", { process: "default" });
					}}
				>
					Go to website
				</Button>
			</Stack>
		</Stack>
	);
}
