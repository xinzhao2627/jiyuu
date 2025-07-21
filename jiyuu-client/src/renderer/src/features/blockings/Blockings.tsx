/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useEffect } from "react";
import { menuButtonStyle, useStore } from "./blockingsStore";
import toast from "react-hot-toast";
import DeleteIcon from "@mui/icons-material/Delete";
import DriveFileRenameOutlineIcon from "@mui/icons-material/DriveFileRenameOutline";
import SettingsIcon from "@mui/icons-material/Settings";
import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import {
	amber,
	blue,
	blueGrey,
	indigo,
	lightGreen,
	lime,
	pink,
	teal,
} from "@mui/material/colors";
import FiberManualRecordIcon from "@mui/icons-material/FiberManualRecord";
import {
	Button,
	Card,
	Stack,
	Typography,
	CardContent,
	CardActions,
	Switch,
	Fab,
	ToggleButton,
	Menu,
	IconButton,
	Chip,
	MenuItem,
	ListItemIcon,
	ListItemText,
	Box,
	SxProps,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import { ipcRendererOn, ipcRendererSend } from "./blockingAPI";
import BlockingModal from "./components/blockingModal";
import NewBlockGroupModal from "./components/newBlockGroupModal";
import DeleteBlockGroupModal from "./components/deleteBlockGroupModal";
import RenameBlockGroupModal from "./components/renameBlockGroupModal";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
	BlockGroup,
	ConfigType,
	Password_Config,
	RandomText_Config,
	RestrictTimer_Config,
	UsageLimitData_Config,
} from "@renderer/shared/types/jiyuuInterfaces";
import ConfigModal from "./components/configModal";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";
import MenuIcon from "@mui/icons-material/Menu";
import { Theme } from "@emotion/react";
function customChip(
	optionalIcon: React.JSX.Element | undefined = undefined,
	label: string | undefined = undefined,
	chipStyle: SxProps<Theme> | undefined = undefined,
	optionalOnClick:
		| React.MouseEventHandler<SVGSwitchElement>
		| undefined = undefined,
): React.JSX.Element {
	return (
		<Chip
			component={"switch"}
			size="small"
			variant="outlined"
			label={
				<Stack direction={"row"} alignItems={"center"} spacing={0.5}>
					{optionalIcon}
					<Typography
						variant="caption"
						sx={{
							fontSize: "12px",
							lineHeight: 1.2,
						}}
					>
						{label}
					</Typography>
				</Stack>
			}
			sx={chipStyle}
			onClick={optionalOnClick}
		/>
	);
}
export default function Blockings(): React.JSX.Element {
	const [menuAnchor, setmenuAnchor] = React.useState<null | {
		el: HTMLElement;
		v: BlockGroup;
	}>(null);
	const {
		blockGroupData,
		setBlockGroupData,
		setBlockedSitesData,
		setSelectedBlockGroup,
		setIsCoveredState,
		setIsBlurredState,
		setIsGrayscaledState,
		setIsMutedState,
		setIsNewGroupModalOpen,
		setIsBlockingModalOpen,
		setIsDeleteGroupModalOpen,
		setIsRenameGroupModalOpen,
		setIsConfigModalOpen,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
	} = useStore();

	const openModal = (v: BlockGroup): void => {
		// GET BLOCK SITE OF SPECIFIC BLOCK GROUP
		ipcRendererSend("blockedsites/get", {
			id: v.id,
			group_name: v.group_name,
		});
		setIsBlockingModalOpen(true);
	};

	useEffect(() => {
		const listeners = [
			{
				channel: "blockedsites/put/response",
				handler: (_, data) => {
					if (data.error)
						console.error("putting target text response: ", data.error);
					else console.info("inserting data success");
				},
			},
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
				// RECEIVE BLOCK GROUP (ONE ONLY) RESPONSE
				channel: "blockgroup/get/id/response",
				handler: (_, data) => {
					if (data.error)
						console.error("Error blockgroup/get/id/response: ", data.error);
				},
			},
			{
				channel: "blockgroup/set/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error blockgroup/set/response: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				// RECEIVE BLOCK GROUP CREATE/PUT RESPONSE (when you create a block  group)
				channel: "blockgroup/put/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error blockgroup/get/response: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				// RECEIVE BLOCK SITE RESPONSE
				channel: "blockedsites/get/response",
				handler: (_, data) => {
					if (data.error)
						console.error("Error fetching group block: ", data.error);
					else setBlockedSitesData(data.data);
				},
			},
			{
				// SETTING ALL BLOCK GROUP DATA AND BLOCKED SITES DATA response
				channel: "blockgroup_blockedsites/set/response",
				handler: (_, data) => {
					if (data.error)
						console.error("ERROR MODIFYING THE ENTIRE GORUP: ", data.error);
					else if (data.info) toast.success(data.info);
				},
			},
			{
				// gets a reply when deleting a block group
				channel: "blockgroup/delete/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error deleting a block group: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				channel: "blockgroupconfig/set/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error setting a block group config: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				channel: "blockgroupconfig/get/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error getting a block group config: ", data.error);
						toast.error(data.error);
					} else if (data.data) {
						const d = data.data as {
							block_group_id: number;
							config_type: ConfigType;
							config_data: string;
						};
						console.log("d isL: ", d);

						if (d && d.config_data) {
							console.log(d);

							const cd = JSON.parse(d.config_data) as
								| UsageLimitData_Config
								| Password_Config
								| RandomText_Config
								| RestrictTimer_Config;

							if (cd && cd.config_type === "usageLimit") {
								setUsageTimeValueNumber({
									val: cd.usage_reset_value,
									mode: cd.usage_reset_value_mode,
								});
								setUsageResetPeriod(cd.usage_reset_type);
							}
						}
					}
				},
			},
		];
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		// GET ALL BLOCK GROUP (INITIALIZATION)
		ipcRendererSend("blockgroup/get", { init: true });

		return () => {
			listeners.forEach((v) => {
				window.electron.ipcRenderer.removeAllListeners(v.channel);
			});
		};
	}, []);

	return (
		<>
			<Stack
				sx={{
					height: "100%",
				}}
			>
				<Stack
					sx={{
						flex: 1,
						overflowY: "auto",
						paddingBottom: 1,
						...scrollbarStyle,
					}}
				>
					{blockGroupData &&
						blockGroupData.map((v: BlockGroup, i) => {
							// console.log(v);

							return (
								<Card
									// sx={{ maxWidth: 345 }}
									sx={{
										borderRadius: 0,
										padding: 1,
										marginBottom: "2px",
										minHeight: "140px",
									}}
									key={`${v.id} - ${i}`}
								>
									{/* <Box sx={{ backgroundColor: "#b5d9a3", height: 100 }}></Box> */}
									<CardContent sx={{ paddingBottom: 0 }}>
										<Stack direction={"row"} justifyContent={"space-between"}>
											<Stack direction={"row"} gap={1}>
												{customChip(
													<Box
														sx={{
															width: 6,
															height: 6,
															borderRadius: "50%",
															backgroundColor: v.is_activated
																? teal[500]
																: "grey.400",
														}}
													/>,
													v.is_activated ? "Active" : "Inactive",
													{
														color: v.is_activated
															? teal[500]
															: "text.secondary",
														fontWeight: v.is_activated ? 600 : "initial",
														borderColor: v.is_activated
															? teal[500]
															: "grey.300",
													},
													!v.is_restricted
														? () => {
																ipcRendererSend("blockgroup/set", {
																	group: {
																		...v,
																		is_activated: v.is_activated ? 0 : 1,
																	},
																});
															}
														: undefined,
												)}
												{v.is_restricted
													? customChip(
															<LockIcon
																sx={{
																	width: 12,
																	height: 12,
																	borderRadius: "50%",
																	color: "grey.600",
																}}
															/>,
															"Locked",
															{
																color: "grey.600",
																borderColor: "grey.500",
															},
														)
													: undefined}
												{/* TODO ADD USAGE TIME IN DISPLAY (CHIP & TIME LEFT) */}
												{}
												{v.is_covered
													? customChip(undefined, "Covered", {
															color: pink[500],
															borderColor: pink[500],
														})
													: undefined}
												{v.is_muted
													? customChip(undefined, "Muted", {
															color: indigo[500],
															borderColor: indigo[500],
														})
													: undefined}
												{v.is_grayscaled
													? customChip(undefined, "Grayscaled", {
															color: blueGrey[800],
															borderColor: blueGrey[800],
														})
													: undefined}
												{v.is_blurred
													? customChip(undefined, "Blurred", {
															color: lightGreen[900],
															borderColor: lightGreen[900],
														})
													: undefined}
											</Stack>
											<IconButton
												sx={{ p: 0 }}
												disableRipple
												onClick={(e) => {
													setmenuAnchor({ el: e.currentTarget, v: v });
												}}
											>
												<MoreHorizIcon sx={{ color: "black" }} />
											</IconButton>
										</Stack>

										<Stack
											direction={"row"}
											mt={2}
											justifyContent={"space-between"}
										>
											<Typography
												variant="h5"
												letterSpacing={1}
												component={"div"}
												onClick={() => {
													setSelectedBlockGroup(v);
													setIsCoveredState(v.is_covered);
													setIsGrayscaledState(v.is_grayscaled);
													setIsMutedState(v.is_muted);
													setIsBlurredState(v.is_blurred);
													openModal(v);
												}}
												sx={{
													color: "#424242",
													"&:hover": { color: "#229799" },
													transition: "all 0.15s ease-in-out",
													cursor: "pointer",
													width: "fit-content",
													fontWeight: 500,
												}}
												py={"2px"}
											>
												{v.group_name}
											</Typography>
											<Button
												disableRipple
												size="small"
												variant="contained"
												disableElevation
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v);
													setIsConfigModalOpen(true);
												}}
											>
												{v.is_restricted ? <LockIcon /> : <LockOpenIcon />}{" "}
												<Typography ml={0.5} fontSize={"14px"}>
													{v.is_restricted ? "Locked" : "Unlocked"}
												</Typography>
											</Button>
										</Stack>
									</CardContent>
								</Card>
							);
						})}
				</Stack>

				{/* Floating Action Button */}
				<Fab
					color="primary"
					variant="extended"
					disableRipple
					onClick={() => {
						setIsNewGroupModalOpen(true);
					}}
					sx={{
						position: "fixed",
						bottom: 90,
						right: 20,
						letterSpacing: 1,
						zIndex: 100,
						fontWeight: 500,
					}}
				>
					<AddIcon sx={{ mr: 1 }} /> Add group
				</Fab>
			</Stack>
			<BlockingModal />
			<NewBlockGroupModal />
			<DeleteBlockGroupModal />
			<RenameBlockGroupModal />
			<ConfigModal />
			<Menu
				anchorEl={menuAnchor?.el}
				open={Boolean(menuAnchor?.el)}
				onClose={() => {
					setmenuAnchor(null);
				}}
			>
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						setSelectedBlockGroup(menuAnchor?.v);
						setIsDeleteGroupModalOpen(true);
						setmenuAnchor(null);
					}}
				>
					<ListItemIcon>
						<DeleteIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText sx={{ letterSpacing: 0.7 }}>Delete</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						setSelectedBlockGroup(menuAnchor?.v);
						setIsRenameGroupModalOpen(true);
						setmenuAnchor(null);
					}}
				>
					<ListItemIcon>
						<DriveFileRenameOutlineIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText sx={{ letterSpacing: 0.7 }}>Rename</ListItemText>
				</MenuItem>
				<MenuItem
					onClick={(e) => {
						e.stopPropagation();
						setSelectedBlockGroup(menuAnchor?.v);
						setIsConfigModalOpen(true);
						setmenuAnchor(null);
					}}
				>
					<ListItemIcon>
						<SettingsIcon fontSize="small" />
					</ListItemIcon>
					<ListItemText sx={{ letterSpacing: 0.7 }}>
						Open configuration
					</ListItemText>
				</MenuItem>
			</Menu>
		</>
	);
}
