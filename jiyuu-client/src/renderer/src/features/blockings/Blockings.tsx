import * as React from "react";
import { useEffect } from "react";
import { useStore } from "./blockingsStore";
import toast from "react-hot-toast";

import LockOpenIcon from "@mui/icons-material/LockOpen";
import LockIcon from "@mui/icons-material/Lock";
import {
	blue,
	blueGrey,
	indigo,
	lightGreen,
	pink,
	teal,
} from "@mui/material/colors";
import {
	Button,
	Card,
	Stack,
	Typography,
	CardContent,
	Fab,
	IconButton,
	Box,
} from "@mui/material";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";
import AddIcon from "@mui/icons-material/Add";
import { ipcRendererOn, ipcRendererSend } from "./blockingAPI";
import BlockingModal from "./components/modals/blockingModal";

import MainBlockGroupModal from "./components/modals/MainBlockGroupModal";
import MenuIcon from "@mui/icons-material/Menu";

import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
import {
	block_group,
	block_group_config,
	blocked_content,
	BlockGroup_Full,
	Error_Info,
} from "../../jiyuuInterfaces";
import ConfigModal from "./components/modals/configModal";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";
import { GroupDeactivateDialogue } from "./components/modals/deactivateDialogue";
import UsageAndPauseMenu from "./components/usageLabel";
import { saveAs } from "file-saver";
import { CustomChip } from "@renderer/assets/shared/customChip";
import { BlockGroupMenu } from "./menu/blockGroupMenu";
import { ExportAndImportBlockGroup } from "./menu/exportAndImportBlockGroup";

export default function Blockings(): React.JSX.Element {
	const {
		setBlockGroupModal,
		setBlockGroupData,
		setSelectedBlockGroup,
		setIsConfigModalOpen,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
		setBlockedContentData,
		blockGroup,
		setBlockGroupMenuAnchor,
		setBlockedContentState,
		setFabGroupMenuAnchor,
		// selectedBlockGroup,
	} = useStore();

	const openModal = (v: block_group): void => {
		// GET BLOCK SITE OF SPECIFIC BLOCK GROUP
		ipcRendererSend("blockedcontent/get", {
			id: v.id,
			group_name: v.group_name,
		});
		setBlockGroupModal("blockingModal", true);
	};
	const modifyActivateButton = (v: BlockGroup_Full): void => {
		if (!v.usage_label || v.usage_label.includes("pause")) {
			ipcRendererSend("blockgroup/set", {
				group: {
					...v,
					is_activated: v.is_activated ? 0 : 1,
				},
			});
		} else {
			setSelectedBlockGroup(v);
			setBlockGroupModal("deactivateGroupModal", true);
		}
	};
	const modifyAutoDeactivateButton = (v: BlockGroup_Full): void => {
		ipcRendererSend("blockgroup/set", {
			group: {
				...v,
				auto_deactivate: v.auto_deactivate ? 0 : 1,
			},
		});
	};
	// const [isBlockGroupRetrieveReady, setIsBlockGroupRetrieveReady] =
	// 	useState<boolean>(true);

	useEffect(() => {
		let isUnmounted = false;
		let isReady = true;
		let timerId: NodeJS.Timeout | null = null;
		const getBlockGroup = (): void => {
			if (isReady && !isUnmounted) {
				isReady = false;
				ipcRendererSend("blockgroup/get", { init: true });
			}
		};
		const listeners = [
			{
				channel: "blockedcontent/put/response",
				handler: (_, data: Error_Info) => {
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
					// setIsBlockGroupRetrieveReady(true);
					isReady = true;
					console.log("HEY IM CALLED");
					if (timerId) {
						clearTimeout(timerId);
					}

					if (!isUnmounted) {
						timerId = setTimeout(() => getBlockGroup(), 1000);
					}
				},
			},
			{
				// RECEIVE BLOCK GROUP (ONE ONLY) RESPONSE
				channel: "blockgroup/get/id/response",
				handler: (_, data: Error_Info) => {
					if (data.error)
						console.error("Error blockgroup/get/id/response: ", data.error);
				},
			},
			{
				channel: "blockgroup/set/response",
				handler: (_, data: Error_Info) => {
					if (data.error) {
						console.error("Error blockgroup/set/response: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				// RECEIVE BLOCK GROUP CREATE/PUT RESPONSE (when you create a block  group)
				channel: "blockgroup/put/response",
				handler: (_, data: Error_Info) => {
					if (data.error) {
						console.error("Error blockgroup/get/response: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				// RECEIVE BLOCK SITE RESPONSE
				channel: "blockedcontent/get/response",
				handler: (
					_,
					data: { error: string | undefined; data: blocked_content[] },
				) => {
					if (data.error)
						console.error("Error fetching group block: ", data.error);
					else setBlockedContentData(data.data);
				},
			},
			{
				channel: "blockedcontent/export/response",
				handler: (
					_,
					data: {
						error: string | undefined;
						data: blocked_content[];
						group_name: string;
					},
				) => {
					if (data.error)
						console.error("Error exporting group block: ", data.error);
					else {
						const blob = new Blob(
							data.data.map((b) =>
								b.is_absolute
									? "{a}" + b.target_text + "\n"
									: b.target_text + "\n",
							),
							{ type: "text/plain;charset=utf-8" },
						);
						saveAs(blob, data.group_name + ".txt");
					}
					setBlockGroupMenuAnchor(null);
				},
			},
			{
				channel: "jiyuu/export/response",
				handler: (
					_,
					data: {
						error: string | undefined;
						json_string: string;
					},
				) => {
					console.log("received data: ", data.json_string);

					if (data.error) console.error("Error exporting", data.error);
					else if (data.json_string) {
						const blob = new Blob([data.json_string], {
							type: "application/json",
						});
						saveAs(blob, "jiyuu-export.json");
					}
					setFabGroupMenuAnchor(null);
				},
			},
			{
				channel: "jiyuu/import/response",
				handler: (
					_,
					data: {
						error: string | undefined;
					},
				) => {
					if (data.error) console.error("Error importing", data.error);
					setFabGroupMenuAnchor(null);
				},
			},
			{
				// SETTING ALL BLOCK GROUP DATA AND BLOCKED SITES DATA response
				channel: "blockgroup_blockedcontent/set/response",
				handler: (_, data: Error_Info) => {
					if (data.error)
						console.error("ERROR MODIFYING THE ENTIRE GORUP: ", data.error);
					else if (data.info) toast.success(data.info);
				},
			},
			{
				// gets a reply when deleting a block group
				channel: "blockgroup/delete/response",
				handler: (_, data: Error_Info) => {
					if (data.error) {
						console.error("Error deleting a block group: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				channel: "blockgroupconfig/set/response",
				handler: (_, data: Error_Info) => {
					if (data.error) {
						console.error("Error setting a block group config: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				channel: "blockgroupconfig/get/response",
				handler: (
					_,
					data: { error: string | undefined; data: block_group_config },
				) => {
					if (data.error) {
						console.error("Error getting a block group config: ", data.error);
						toast.error(data.error);
					} else if (data.data) {
						const d = data.data;
						console.log("d isL: ", d);

						if (d && d.config_data) {
							console.log(d);
							const cd = d.config_data;
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
			{
				channel: "blockgroupconfig/delete/response",
				handler: (_, data: Error_Info) => {
					if (data.error) {
						toast.error(data.error);
					} else if (data.info) {
						toast.success("Restriction successfully removed");
					}
				},
			},
			{
				channel: "blockgroupconfig/usageLimit/pause/set/response",
				handler: (_, data: Error_Info) => {
					if (data.error) {
						toast.error(data.error);
					}
				},
			},
		];
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		// GET ALL BLOCK GROUP (INITIALIZATION)
		getBlockGroup();

		return () => {
			isUnmounted = true;
			if (timerId) {
				clearTimeout(timerId);
			}
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
					{blockGroup.data &&
						blockGroup.data.map((v, i) => {
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
												<CustomChip
													optionalIcon={
														<Box
															sx={{
																width: 6,
																height: 6,
																borderRadius: "50%",
																backgroundColor: v.is_activated
																	? teal[500]
																	: "grey.400",
															}}
														/>
													}
													label={v.is_activated ? "Active" : "Inactive"}
													chipStyle={{
														color: v.is_activated
															? teal[500]
															: "text.secondary",
														fontWeight: v.is_activated ? 600 : "initial",
														borderColor: v.is_activated
															? teal[500]
															: "grey.300",
													}}
													optionalOnClick={
														v.restriction_type && v.is_activated
															? undefined
															: () => modifyActivateButton(v)
													}
												/>
												<CustomChip
													optionalIcon={undefined}
													label={`Auto deactivate ${v.auto_deactivate ? "on" : "off"}`}
													chipStyle={{
														color: v.auto_deactivate
															? blue[800]
															: "text.secondary",
														fontWeight: v.auto_deactivate ? 600 : "initial",
														borderColor: v.auto_deactivate
															? blue[800]
															: "grey.300",
													}}
													optionalOnClick={() => modifyAutoDeactivateButton(v)}
												/>
												{v.restriction_type ? (
													<CustomChip
														optionalOnClick={undefined}
														optionalIcon={
															<LockIcon
																sx={{
																	width: 12,
																	height: 12,
																	borderRadius: "50%",
																	color: "grey.600",
																}}
															/>
														}
														label="Locked"
														chipStyle={{
															color: "grey.600",
															borderColor: "grey.500",
														}}
													/>
												) : null}
												{v.usage_label ? (
													<CustomChip
														optionalIcon={undefined}
														optionalOnClick={undefined}
														label="Usage limit"
														chipStyle={{
															color: blue[900],
															borderColor: blue[900],
														}}
													/>
												) : null}
												{v.is_covered ? (
													<CustomChip
														optionalIcon={undefined}
														optionalOnClick={undefined}
														label="Covered"
														chipStyle={{
															color: pink[500],
															borderColor: pink[500],
														}}
													/>
												) : null}
												{v.is_muted ? (
													<CustomChip
														optionalIcon={undefined}
														optionalOnClick={undefined}
														label="Muted"
														chipStyle={{
															color: indigo[500],
															borderColor: indigo[500],
														}}
													/>
												) : null}
												{v.is_grayscaled ? (
													<CustomChip
														optionalIcon={undefined}
														optionalOnClick={undefined}
														label="Grayscaled"
														chipStyle={{
															color: blueGrey[800],
															borderColor: blueGrey[800],
														}}
													/>
												) : null}
												{v.is_blurred ? (
													<CustomChip
														optionalIcon={undefined}
														optionalOnClick={undefined}
														label="Blurred"
														chipStyle={{
															color: lightGreen[900],
															borderColor: lightGreen[900],
														}}
													/>
												) : null}
											</Stack>
											<IconButton
												sx={{ p: 0 }}
												disableRipple
												onClick={(e) => {
													setBlockGroupMenuAnchor({
														el: e.currentTarget,
														v: v,
													});
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
												minWidth={"33%"}
												onClick={() => {
													setSelectedBlockGroup(v);
													setBlockedContentState("covered", {
														val: Boolean(v.is_covered),
														init_val: Boolean(v.is_covered),
													});
													setBlockedContentState("grayscaled", {
														val: Boolean(v.is_grayscaled),
														init_val: Boolean(v.is_grayscaled),
													});
													setBlockedContentState("muted", {
														val: Boolean(v.is_muted),
														init_val: Boolean(v.is_muted),
													});
													setBlockedContentState("blurred", {
														val: Boolean(v.is_blurred),
														init_val: Boolean(v.is_blurred),
													});
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
											{v.usage_label && <UsageAndPauseMenu blockGroup={v} />}

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
												{v.restriction_type ? <LockIcon /> : <LockOpenIcon />}{" "}
												<Typography ml={0.5} fontSize={"14px"}>
													{v.restriction_type ? "Locked" : "Unlocked"}
												</Typography>
											</Button>
										</Stack>
									</CardContent>
								</Card>
							);
						})}
				</Stack>

				{/* Floating Action Button */}
				<Box
					sx={{
						position: "fixed",
						bottom: 90,
						right: 20,
						letterSpacing: 1,
						fontWeight: 500,
						overflow: "hidden",
						borderRadius: "50px",
						boxShadow: 3,
						display: "flex",
					}}
				>
					<Fab
						color="primary"
						variant="extended"
						disableRipple
						sx={{
							borderRadius: "0px",
							boxShadow: "none",
						}}
						onClick={() => {
							setBlockGroupModal("add", true);
						}}
					>
						<AddIcon sx={{ mr: 1 }} /> Add group
					</Fab>
					<Box
						sx={{
							width: "1px",
							bgcolor: "rgba(255,255,255,0.5)",
							alignSelf: "stretch",
						}}
					/>
					<IconButton
						onClick={(e) => setFabGroupMenuAnchor(e.currentTarget)}
						sx={{
							color: "inherit",
							borderRadius: 0,
							px: 1.5,
						}}
					>
						<MenuIcon />
					</IconButton>
				</Box>
			</Stack>
			<BlockingModal />
			<MainBlockGroupModal />
			<ConfigModal />
			<BlockGroupMenu />
			<GroupDeactivateDialogue />
			<ExportAndImportBlockGroup />
		</>
	);
}
