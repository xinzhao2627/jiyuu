import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	Button,
	IconButton,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { isURL } from "@renderer/assets/shared/general_helper";
import { whitelist } from "@renderer/jiyuuInterfaces";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import { uiStyles } from "@renderer/assets/shared/uiStyles";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";

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
	const addWhitelistItem = (): void => {
		const cleaned_item = whitelistItem.toLowerCase().trim();
		const wl_type = "url";
		if (!isURL(cleaned_item)) {
			toast.error("item must be a url!");
			return;
		}

		ipcRendererSend("whitelist/put", {
			item: cleaned_item,
			whitelist_type: wl_type,
		});
	};
	return (
		<Box sx={uiStyles.pageShell}>
			<Stack sx={uiStyles.pageInner} spacing={2.5}>
				<Box>
					<Typography variant="overline" sx={uiStyles.eyebrow}>
						Whitelist
					</Typography>
					<Typography variant="h4" sx={uiStyles.pageTitle}>
						Allowed sites
					</Typography>
					<Typography variant="body2" sx={uiStyles.pageSubtitle}>
						Add URLs that should remain reachable while block groups are active.
					</Typography>
				</Box>
				<Box sx={{ ...uiStyles.sectionCard, p: 2 }}>
					<Stack direction={{ xs: "column", sm: "row" }} gap={1.5}>
						<TextField
							type="text"
							label="Whitelist URL"
							placeholder="facebook.com or reddit.com/r/funny"
							value={whitelistItem}
							fullWidth
							onChange={(e) => {
								setWhitelistItem(e.target.value);
							}}
							onKeyDown={(e) => {
								if (e.key.toLowerCase() === "enter") {
									addWhitelistItem();
								}
							}}
							helperText="Press Enter or use Add URL to save it."
						/>
						<Button
							variant="contained"
							startIcon={<AddIcon />}
							onClick={addWhitelistItem}
							sx={{
								minWidth: { xs: "100%", sm: 132 },
								alignSelf: { xs: "stretch", sm: "flex-start" },
								height: 40,
							}}
						>
							Add URL
						</Button>
					</Stack>
				</Box>
				<Stack
					gap={1}
					overflow="auto"
					sx={{
						...scrollbarStyle,
						minHeight: 280,
					}}
				>
					{whitelistData.length > 0 ? (
						<>
							{whitelistData.map((v, i) => {
								return (
									<Box
										key={`${v} - ${i}`}
										sx={{
											...uiStyles.listItemCard,
											p: 1,
											display: "flex",
											alignItems: "center",
											gap: 1,
										}}
									>
										<Typography
											variant="body1"
											color="text.primary"
											width={"100%"}
											textTransform={"none"}
											sx={{
												overflow: "hidden",
												textOverflow: "ellipsis",
												whiteSpace: "nowrap",
											}}
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
						<Box sx={uiStyles.emptyState}>
							<Typography variant="body1" color="text.secondary">
								The whitelist is currently empty.
							</Typography>
						</Box>
					)}
				</Stack>
			</Stack>
		</Box>
	);
}
