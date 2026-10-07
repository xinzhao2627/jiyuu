import React, { useState, useEffect } from "react";
import {
	Box,
	Stack,
	Typography,
	IconButton,
	Badge,
	Popover,
	Button,
	Divider,
	Chip,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import DoneAllIcon from "@mui/icons-material/DoneAll";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import toast from "react-hot-toast";
import { useNotifications } from "../features/notifications/useNotifications";
import {
	ipcRendererOn,
	ipcRendererSend,
} from "../features/blockings/blockingAPI";

export default function TopHeader(): React.JSX.Element {
	const { notifs, readIds, unreadCount, markAsRead, markAllAsRead } =
		useNotifications();

	const [urlList, setUrlList] = useState<{ process: string; url: string }[]>(
		[],
	);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);

	useEffect(() => {
		const listeners = [
			{
				channel: "openurl/response",
				handler: (_, data) => {
					if (data?.error) {
						toast.error("Error opening url");
					}
				},
			},
			{
				channel: "extensionwarning/response",
				handler: (_, data) => {
					if (data?.error) {
						console.log(data.error);
					} else if (data?.data) {
						setUrlList(data.data);
					}
				},
			},
		];

		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);

	const handleOpenPopover = (
		event: React.MouseEvent<HTMLButtonElement>,
	): void => {
		setAnchorEl(event.currentTarget);
	};

	const handleClosePopover = (): void => {
		setAnchorEl(null);
	};

	const open = Boolean(anchorEl);

	const handleOpenLink = (url?: string): void => {
		if (url) {
			window.open(url, "_blank");
		}
	};

	return (
		<Box
			sx={{
				width: "100%",
				display: "flex",
				justifyContent: "space-between",
				alignItems: "center",
				px: { xs: 1.5, sm: 2.5 },
				pt: 1.25,
				pb: 0.5,
				gap: 1.5,
				flexShrink: 0,
			}}
		>
			{/* Left: Compact Extension Warning Banner */}
			{urlList && urlList.length > 0 ? (
				<Box
					sx={{
						flex: 1,
						minWidth: 0,
						display: "flex",
						alignItems: "center",
						gap: 1,
						px: 1.25,
						py: 0.4,
						borderRadius: 1,
						backgroundColor: "rgba(217, 119, 6, 0.08)",
						border: "1px solid",
						borderColor: "warning.light",
						overflow: "hidden",
					}}
				>
					<WarningAmberIcon
						color="warning"
						sx={{ fontSize: 16, flexShrink: 0 }}
					/>
					<Typography
						variant="caption"
						sx={{
							fontSize: 11,
							fontWeight: 600,
							color: "text.primary",
							whiteSpace: "nowrap",
							flexShrink: 0,
						}}
					>
						Extension needed:
					</Typography>
					<Stack
						direction="row"
						gap={0.5}
						alignItems="center"
						sx={{
							overflowX: "auto",
							py: 0.25,
							"&::-webkit-scrollbar": { display: "none" },
						}}
					>
						{urlList.map((v, i) => (
							<Chip
								key={`${v.process}-${i}`}
								label={v.process}
								size="small"
								clickable
								variant="outlined"
								color="warning"
								deleteIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
								onDelete={() => {
									ipcRendererSend("openurl", {
										url: v.url,
										process: v.process,
									});
								}}
								onClick={() => {
									ipcRendererSend("openurl", {
										url: v.url,
										process: v.process,
									});
								}}
								sx={{
									height: 20,
									fontSize: 10.5,
									fontWeight: 500,
									"& .MuiChip-label": { px: 0.75 },
								}}
							/>
						))}
					</Stack>
				</Box>
			) : (
				<Box sx={{ flex: 1 }} />
			)}

			{/* Right: Notifications Bell Icon */}
			<IconButton
				size="small"
				onClick={handleOpenPopover}
				aria-label="notifications"
				disableRipple
				sx={{
					width: 30,
					height: 30,
					borderRadius: 1,
					border: "1px solid",
					borderColor: open ? "primary.main" : "divider",
					backgroundColor: "transparent",
					color: open ? "primary.main" : "text.secondary",
					transition: "border-color 0.15s ease",
					flexShrink: 0,
					"&:hover": {
						borderColor: "primary.main",
						color: "text.primary",
						backgroundColor: "transparent",
					},
				}}
			>
				<Badge
					badgeContent={unreadCount}
					color="error"
					sx={{
						"& .MuiBadge-badge": {
							fontSize: 10,
							height: 15,
							minWidth: 15,
							padding: "0 3px",
							fontWeight: 700,
						},
					}}
				>
					<NotificationsOutlinedIcon sx={{ fontSize: 17 }} />
				</Badge>
			</IconButton>

			{/* Flat Quiet Notifications Popover */}
			<Popover
				open={open}
				anchorEl={anchorEl}
				onClose={handleClosePopover}
				anchorOrigin={{
					vertical: "bottom",
					horizontal: "right",
				}}
				transformOrigin={{
					vertical: "top",
					horizontal: "right",
				}}
				slotProps={{
					paper: {
						sx: {
							width: 340,
							maxHeight: 440,
							borderRadius: 1.5,
							mt: 0.75,
							border: "1px solid",
							borderColor: "divider",
							boxShadow: "none",
							backgroundColor: "background.paper",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						},
					},
				}}
			>
				{/* Popover Header */}
				<Box
					sx={{
						p: 1.5,
						pb: 1,
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
					}}
				>
					<Typography variant="subtitle2" sx={{ fontWeight: 700 }}>
						Notifications
					</Typography>

					{unreadCount > 0 && (
						<Button
							size="small"
							startIcon={<DoneAllIcon sx={{ fontSize: 14 }} />}
							onClick={markAllAsRead}
							disableRipple
							sx={{
								fontSize: 11,
								fontWeight: 600,
								textTransform: "none",
								py: 0.25,
								px: 0.75,
								color: "text.secondary",
								"&:hover": {
									color: "primary.main",
									backgroundColor: "transparent",
								},
							}}
						>
							Mark all read
						</Button>
					)}
				</Box>

				<Divider />

				{/* Popover Content */}
				<Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
					{notifs.length === 0 ? (
						<Box
							sx={{
								py: 4,
								textAlign: "center",
								color: "text.secondary",
							}}
						>
							<Typography variant="body2" sx={{ fontSize: 12.5 }}>
								No notifications
							</Typography>
						</Box>
					) : (
						<Stack spacing={0.75}>
							{notifs.map((item) => {
								const isRead = readIds.includes(item.id);
								return (
									<Box
										key={item.id}
										onClick={() => markAsRead(item.id)}
										sx={{
											p: 1.25,
											borderRadius: 1,
											border: "1px solid",
											borderColor: isRead ? "divider" : "primary.main",
											backgroundColor: "background.paper",
											transition: "border-color 0.15s ease",
											"&:hover": {
												borderColor: "primary.main",
											},
											cursor: "pointer",
										}}
									>
										<Stack
											direction="row"
											alignItems="center"
											justifyContent="space-between"
											mb={0.5}
										>
											<Stack direction="row" alignItems="center" spacing={0.75}>
												<Chip
													label={item.tag || item.type}
													size="small"
													variant="outlined"
													sx={{
														height: 18,
														fontSize: 9.5,
														fontWeight: 700,
														textTransform: "uppercase",
														borderColor: "divider",
														"& .MuiChip-label": { px: 0.75 },
													}}
												/>
												{!isRead && (
													<Box
														sx={{
															width: 6,
															height: 6,
															borderRadius: "50%",
															backgroundColor: "error.main",
														}}
													/>
												)}
											</Stack>

											<Typography
												variant="caption"
												sx={{
													color: "text.secondary",
													fontSize: 10.5,
												}}
											>
												{item.date
													? new Date(item.date).toLocaleDateString()
													: ""}
											</Typography>
										</Stack>

										{item.title && (
											<Typography
												variant="body2"
												sx={{
													fontWeight: isRead ? 500 : 700,
													fontSize: 12.5,
													mb: 0.25,
													color: "text.primary",
												}}
											>
												{item.title}
											</Typography>
										)}

										<Typography
											variant="body2"
											sx={{
												color: "text.secondary",
												fontSize: 12,
												lineHeight: 1.45,
											}}
										>
											{item.summary}
										</Typography>

										{item.url && (
											<Button
												size="small"
												disableRipple
												endIcon={<OpenInNewIcon sx={{ fontSize: 12 }} />}
												onClick={(e) => {
													e.stopPropagation();
													markAsRead(item.id);
													handleOpenLink(item.url);
												}}
												sx={{
													mt: 0.75,
													fontSize: 11,
													p: 0,
													minWidth: 0,
													fontWeight: 600,
													textTransform: "none",
													color: "primary.main",
													"&:hover": {
														backgroundColor: "transparent",
														textDecoration: "underline",
													},
												}}
											>
												Learn more
											</Button>
										)}
									</Box>
								);
							})}
						</Stack>
					)}
				</Box>
			</Popover>
		</Box>
	);
}
