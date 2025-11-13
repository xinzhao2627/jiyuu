import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	FilledInput,
	FormControl,
	IconButton,
	InputLabel,
	Stack,
	// ToggleButton,
	// ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { isURL } from "@renderer/assets/shared/general_helper";
import { whitelist } from "@renderer/jiyuuInterfaces";
import ClearIcon from "@mui/icons-material/Clear";

export default function Whitelist(): React.JSX.Element {
	const [whitelistData, setWhitelistData] = useState<string[]>([]);
	const [whitelistItem, setWhitelistItem] = useState<string>("");
	useEffect(() => {
		const listeners = [
			{
				channel: "whitelist/put/response",
				handler: (_, data: { error: string }) => {
					if (data.error) {
						toast.error(data.error);
						// console.log();
					} else {
						toast.success("successfully added");
						setWhitelistItem("");
					}
				},
			},
			{
				channel: "whitelist/get/response",
				handler: (_, data: { error: string; data: whitelist[] }) => {
					if (data.error) {
						toast.error("error fetching whitelist data");
						console.log(data.error);
					} else {
						setWhitelistData(data.data.map((v) => v.item));
					}
				},
			},
			{
				channel: "whitelist/delete/response",
				handler: (_, data: { error: string }) => {
					if (data.error) {
						toast.error("error fetching whitelist data");
						console.log(data.error);
					} else {
						toast.success("deleted successfully");
					}
				},
			},
		];
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
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
				{/* <ToggleButtonGroup
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
				</ToggleButtonGroup> */}
				<FormControl
					fullWidth
					sx={{
						mt: 2,
						p: 0,
						"& input": {
							caretColor: "black",
						},
					}}
					variant="filled"
				>
					<InputLabel htmlFor="">Enter whitelist item here</InputLabel>
					<FilledInput
						type="text"
						value={whitelistItem}
						onChange={(e) => {
							setWhitelistItem(e.target.value);
						}}
						onKeyDown={(e) => {
							const k = e.key.toLowerCase();
							if (k === "enter") {
								const cleaned_item = whitelistItem.toLowerCase().trim();
								// CHECK IF item is url
								const wl_type = "url";
								if (!isURL(cleaned_item)) {
									toast.error("item must be a url!");
									return;
								}

								// TODO: add file path.. for future versions

								// put into whitelist backend
								ipcRendererSend("whitelist/put", {
									item: cleaned_item,
									whitelist_type: wl_type,
								});
							}
						}}
					/>
				</FormControl>{" "}
				<Typography variant="caption" sx={{ m: 1 }} color="textSecondary">
					Press Enter to add a url
					{" (e.g: facebook.com OR reddit.com/r/funny)"}
				</Typography>
				<Stack
					alignContent={"center"}
					height={"100%"}
					mt={2}
					gap={1}
					overflow={"auto"}
				>
					{whitelistData.length > 0 ? (
						<>
							{whitelistData.map((v, i) => {
								return (
									<Box
										border={"1px solid #CBCBCB"}
										p={0.3}
										key={`${v} - ${i}`}
										display={"flex"}
										alignContent={"center"}
										alignItems={"center"}
									>
										<Typography
											variant="body1"
											color="initial"
											ml={1}
											width={"100%"}
											textTransform={"none"}
										>
											{v}
										</Typography>
										<IconButton
											size="small"
											onClick={() => {
												ipcRendererSend("whitelist/delete", { item: v });
											}}
										>
											<ClearIcon />
										</IconButton>
									</Box>
								);
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
