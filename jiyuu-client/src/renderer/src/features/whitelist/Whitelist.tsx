import React, { useEffect, useState } from "react";
import toast from "react-hot-toast";
import { ipcRendererOn, ipcRendererSend } from "../blockings/blockingAPI";
import {
	Box,
	Button,
	IconButton,
	InputAdornment,
	Stack,
	TextField,
	Typography,
} from "@mui/material";
import { isURL } from "@renderer/assets/shared/general_helper";
import { whitelist } from "@renderer/jiyuuInterfaces";
import ClearIcon from "@mui/icons-material/Clear";
import AddIcon from "@mui/icons-material/Add";
import LanguageIcon from "@mui/icons-material/Language";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

export default function Whitelist(): React.JSX.Element {
	const [whitelistData, setWhitelistData] = useState<string[]>([]);
	const [whitelistItem, setWhitelistItem] = useState<string>("");

	useEffect(() => {
		const listeners = [
			{
				channel: "whitelist/put/response",
				handler: (_: unknown, data: { error?: string }) => {
					if (data.error) {
						toast.error(data.error);
					} else {
						toast.success("Domain added to whitelist");
						setWhitelistItem("");
					}
				},
			},
			{
				channel: "whitelist/get/response",
				handler: (_: unknown, data: { error?: string; data: whitelist[] }) => {
					if (data.error) {
						toast.error("Failed to load whitelist");
					} else {
						setWhitelistData(data.data.map((v) => v.item));
					}
				},
			},
			{
				channel: "whitelist/delete/response",
				handler: (_: unknown, data: { error?: string }) => {
					if (data.error) {
						toast.error("Failed to remove item");
					} else {
						toast.success("Domain removed from whitelist");
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
		const cleaned = whitelistItem.toLowerCase().trim();
		if (!cleaned) return;
		if (!isURL(cleaned)) {
			toast.error("Please enter a valid URL or domain");
			return;
		}

		ipcRendererSend("whitelist/put", {
			item: cleaned,
			whitelist_type: "url",
		});
	};

	return (
		<Box sx={uiStyles.pageShell}>
			<Stack sx={uiStyles.pageInner} spacing={2.5}>
				<Box>
					<Typography variant="overline" sx={uiStyles.eyebrow}>
						Allowlist
					</Typography>
					<Typography variant="h4" sx={uiStyles.pageTitle}>
						Permitted Websites
					</Typography>
					<Typography variant="body2" sx={uiStyles.pageSubtitle}>
						Configure domains that bypass active restrictions across all block
						groups.
					</Typography>
				</Box>

				<Stack
					direction={{ xs: "column", sm: "row" }}
					gap={1}
					alignItems="center"
					sx={{
						...uiStyles.toolbarGroup,
					}}
				>
					<TextField
						size="small"
						placeholder="domain.com or example.org/resource"
						value={whitelistItem}
						fullWidth
						onChange={(e) => setWhitelistItem(e.target.value)}
						onKeyDown={(e) => {
							if (e.key === "Enter") {
								addWhitelistItem();
							}
						}}
						InputProps={{
							startAdornment: (
								<InputAdornment position="start">
									<LanguageIcon
										fontSize="small"
										sx={{ color: "text.secondary" }}
									/>
								</InputAdornment>
							),
						}}
					/>
					<Button
						variant="contained"
						startIcon={<AddIcon />}
						onClick={addWhitelistItem}
						sx={{
							minWidth: { xs: "100%", sm: 110 },
							height: 38,
							flexShrink: 0,
						}}
					>
						Add URL
					</Button>
				</Stack>

				<Stack spacing={1}>
					{whitelistData.length > 0 ? (
						whitelistData.map((item, index) => (
							<Stack
								key={`${item}-${index}`}
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								px={1.5}
								py={0.875}
								sx={uiStyles.listItemCard}
							>
								<Typography
									variant="body2"
									sx={{
										fontFamily: 'Consolas, "Roboto Mono", monospace',
										fontSize: "0.8125rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										pr: 1,
									}}
								>
									{item}
								</Typography>
								<IconButton
									size="small"
									aria-label="Remove URL"
									onClick={() => {
										ipcRendererSend("whitelist/delete", { item });
									}}
									sx={{
										color: "text.secondary",
										"&:hover": { color: "error.main" },
									}}
								>
									<ClearIcon fontSize="small" />
								</IconButton>
							</Stack>
						))
					) : (
						<Box sx={uiStyles.emptyState}>
							<Typography variant="body2" color="text.secondary">
								No whitelist entries configured.
							</Typography>
						</Box>
					)}
				</Stack>
			</Stack>
		</Box>
	);
}
