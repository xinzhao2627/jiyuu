import React, { useState, useEffect } from "react";
import {
	Box,
	Stack,
	Typography,
	IconButton,
	Badge,
	Popover,
	Divider,
	Chip,
	Tabs,
	Tab,
	Dialog,
	DialogTitle,
	DialogContent,
} from "@mui/material";
import NotificationsOutlinedIcon from "@mui/icons-material/NotificationsOutlined";
import OpenInNewIcon from "@mui/icons-material/OpenInNew";
import CheckCircleOutlineIcon from "@mui/icons-material/CheckCircleOutline";
import CheckIcon from "@mui/icons-material/Check";
import WarningAmberIcon from "@mui/icons-material/WarningAmber";
import toast from "react-hot-toast";
import { useNotifications } from "../features/notifications/useNotifications";
import {
	ipcRendererOn,
	ipcRendererSend,
} from "../features/blockings/blockingAPI";
import type { Notif } from "../Notification";

function renderInlineMarkdown(text: string): React.ReactNode[] {
	const pattern =
		/(\*\*.+?\*\*|\*.+?\*|`.+?`|\[[^\]]+\]\(https?:\/\/[^\s)]+\))/g;
	return text
		.split(pattern)
		.filter(Boolean)
		.map((part, index) => {
			if (part.startsWith("**") && part.endsWith("**")) {
				return <strong key={index}>{part.slice(2, -2)}</strong>;
			}
			if (part.startsWith("*") && part.endsWith("*")) {
				return <em key={index}>{part.slice(1, -1)}</em>;
			}
			if (part.startsWith("`") && part.endsWith("`")) {
				return <code key={index}>{part.slice(1, -1)}</code>;
			}
			const link = part.match(/^\[([^\]]+)\]\((https?:\/\/[^\s)]+)\)$/);
			if (link) {
				return (
					<a key={index} href={link[2]} target="_blank" rel="noreferrer">
						{link[1]}
					</a>
				);
			}
			return part;
		});
}

function MarkdownMessage({ content }: { content: string }): React.JSX.Element {
	const lines = content.split(/\r?\n/);
	const blocks: React.ReactNode[] = [];
	let list: string[] = [];

	const flushList = (): void => {
		if (!list.length) return;
		blocks.push(
			<ul key={`list-${blocks.length}`}>
				{list.map((item, index) => (
					<li key={index}>{renderInlineMarkdown(item)}</li>
				))}
			</ul>,
		);
		list = [];
	};

	lines.forEach((line, index) => {
		const heading = line.match(/^(#{1,6})\s+(.+)$/);
		const bullet = line.match(/^\s*[-*+]\s+(.+)$/);
		if (bullet) {
			list.push(bullet[1]);
			return;
		}
		flushList();
		if (heading) {
			blocks.push(
				<Typography
					key={index}
					variant={heading[1].length < 3 ? "subtitle1" : "subtitle2"}
					sx={{ fontWeight: 700, mb: 0.5 }}
				>
					{renderInlineMarkdown(heading[2])}
				</Typography>,
			);
		} else if (line.trim()) {
			blocks.push(
				<Typography
					key={index}
					variant="body2"
					sx={{ lineHeight: 1.65, mb: 0.75 }}
				>
					{renderInlineMarkdown(line)}
				</Typography>,
			);
		}
	});
	flushList();

	return (
		<Box
			sx={{
				"& ul": { pl: 2.5, my: 0.75 },
				"& li": { mb: 0.5, fontSize: 13, lineHeight: 1.6 },
				"& a": { color: "primary.main" },
				"& code": {
					px: 0.5,
					py: 0.125,
					borderRadius: 0.5,
					backgroundColor: "action.hover",
					fontFamily: "monospace",
				},
			}}
		>
			{blocks}
		</Box>
	);
}

export default function TopHeader(): React.JSX.Element {
	const { notifs, readIds, unreadCount, setRead, markAllAsRead } =
		useNotifications();

	const [urlList, setUrlList] = useState<{ process: string; url: string }[]>(
		[],
	);
	const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
	const [tab, setTab] = useState<"unread" | "read">("unread");
	const [selectedNotif, setSelectedNotif] = useState<Notif | null>(null);

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

	const visibleNotifs = notifs.filter((item) =>
		tab === "read" ? readIds.includes(item.id) : !readIds.includes(item.id),
	);

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
							width: { xs: "calc(100vw - 16px)", sm: 340 },
							maxWidth: "calc(100vw - 16px)",
							maxHeight: 440,
							borderRadius: 1.5,
							mt: 0.75,
							border: 0,
							boxShadow: "none",
							backgroundColor: "background.paper",
							display: "flex",
							flexDirection: "column",
							overflow: "hidden",
						},
					},
				}}
			>
				<Tabs
					value={tab}
					onChange={(_, value: "unread" | "read") => setTab(value)}
					variant="fullWidth"
					sx={{ minHeight: 40, px: 1.25, pt: 0.5 }}
				>
					<Tab
						value="unread"
						label="Unread"
						sx={{ minHeight: 40, textTransform: "none" }}
					/>
					<Tab
						value="read"
						label="Read"
						sx={{ minHeight: 40, textTransform: "none" }}
					/>
				</Tabs>

				<Box
					component="button"
					onClick={markAllAsRead}
					disabled={unreadCount === 0}
					sx={{
						width: "100%",
						minHeight: 36,
						border: 0,
						borderRadius: 0,
						backgroundColor: "transparent",
						color: "text.secondary",
						font: "inherit",
						cursor: unreadCount ? "pointer" : "default",
						"&:hover:not(:disabled)": { color: "primary.main" },
						"&:disabled": { opacity: 0.5 },
					}}
				>
					Mark all read
				</Box>
				<Divider />

				{/* Popover Content */}
				<Box sx={{ flex: 1, overflowY: "auto", p: 1 }}>
					<Stack spacing={0.75}>
						{visibleNotifs.map((item) => {
							const isRead = readIds.includes(item.id);
							return (
								<Box
									key={item.id}
									sx={{
										px: 0.75,
										py: 0.5,
										borderRadius: 1,
										borderBottom: "1px solid",
										borderColor: "divider",
									}}
								>
									<Stack direction="row" alignItems="center" spacing={0.75}>
										<Box
											component="button"
											onClick={() => {
												setRead(item.id, true);
												setSelectedNotif(item);
											}}
											sx={{
												flex: 1,
												minWidth: 0,
												border: 0,
												p: 0,
												textAlign: "left",
												color: "inherit",
												background: "transparent",
												cursor: "pointer",
											}}
										>
											<Stack
												direction="row"
												justifyContent="space-between"
												gap={1}
											>
												<Typography
													variant="body2"
													sx={{ fontWeight: isRead ? 500 : 700 }}
												>
													{item.title}
												</Typography>
												<Typography
													variant="caption"
													sx={{ color: "text.secondary", flexShrink: 0 }}
												>
													{new Date(item.publishedAt).toLocaleDateString()}
												</Typography>
											</Stack>
											<Typography
												variant="body2"
												sx={{
													color: "text.secondary",
													fontSize: 12,
													lineHeight: 1.45,
												}}
											>
												{item.message}
											</Typography>
										</Box>
										<IconButton
											size="small"
											aria-label={isRead ? "Read" : "Mark as read"}
											disabled={isRead}
											onClick={() => setRead(item.id, true)}
											sx={{ p: 0.5, color: "primary.main" }}
										>
											{isRead ? (
												<CheckCircleOutlineIcon sx={{ fontSize: 18 }} />
											) : (
												<CheckIcon sx={{ fontSize: 18 }} />
											)}
										</IconButton>
									</Stack>
								</Box>
							);
						})}
					</Stack>
				</Box>
			</Popover>
			<Dialog
				open={Boolean(selectedNotif)}
				onClose={() => setSelectedNotif(null)}
				fullWidth
				maxWidth="sm"
			>
				{selectedNotif && (
					<>
						<DialogTitle sx={{ fontWeight: 700, pr: 6 }}>
							{selectedNotif.title}
							<Typography
								component="div"
								variant="caption"
								color="text.secondary"
							>
								{new Date(selectedNotif.publishedAt).toLocaleDateString()}
							</Typography>
						</DialogTitle>
						<DialogContent dividers>
							<MarkdownMessage content={selectedNotif.markdownMessage} />
							{selectedNotif.url && (
								<Typography component="p" variant="body2" sx={{ mt: 2 }}>
									<a href={selectedNotif.url} target="_blank" rel="noreferrer">
										{selectedNotif.url}
									</a>
								</Typography>
							)}
							<details style={{ marginTop: 20 }}>
								<summary>{selectedNotif.type}</summary>
								<pre style={{ overflowX: "auto", fontSize: 11 }}>
									{JSON.stringify(selectedNotif, null, 2)}
								</pre>
							</details>
						</DialogContent>
					</>
				)}
			</Dialog>
		</Box>
	);
}
