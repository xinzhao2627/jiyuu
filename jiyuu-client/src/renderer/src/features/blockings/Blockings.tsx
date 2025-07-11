/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useEffect } from "react";
import { menuButtonStyle, useStore } from "./blockingsStore";
import toast from "react-hot-toast";
import {
	Button,
	Card,
	Stack,
	Typography,
	CardContent,
	CardActions,
	Switch,
	Fab,
} from "@mui/material";
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
import UsageLimitModal from "./components/usageLimitModal";
import { BlockGroup } from "@renderer/shared/types/jiyuuInterfaces";
import ConfigModal from "./components/configModal";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";

export default function Blockings(): React.JSX.Element {
	const {
		blockGroupData,
		setBlockGroupData,
		setBlockedSitesData,
		setSelectedBlockGroup,
		setIsCoveredState,
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
				// RECEIVE BLOCK GROUP (USAGE ONLY) RESPONSE
				channel: "blockgroup/get/usage/response",
				handler: (_, data) => {
					if (data.error)
						console.error("Error blockgroup/get/usage/response: ", data.error);
					else {
						console.log(data);

						setUsageResetPeriod(data.period);
						setUsageTimeValueNumber(data.timeLeft);
					}
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
				channel: "blockgroupconfig/set",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error setting a block group config: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
			{
				channel: "blockgroupconfig/get",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error getting a block group config: ", data.error);
						toast.error(data.error);
					} else if (data.info) toast.success(data.info);
				},
			},
		];
		listeners.forEach((v) => {
			ipcRendererOn(v.channel, v.handler);
		});
		// GET ALL BLOCK GROUP (INITIALIZATION)
		ipcRendererSend("blockgroup/get", { init: true });

		// UPDATES GROUP EVERY MINUTE
		let lt = new Date();
		function recursiveGroupChecker(): void {
			const ct = new Date();
			if (ct.getTime() - lt.getTime() < 60000) {
				setTimeout(recursiveGroupChecker, 1000);
				return;
			}
			lt = ct;
			ipcRendererSend("blockgroup/get", {});
		}
		recursiveGroupChecker();

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
										<Typography
											gutterBottom
											sx={{
												color: "text.secondary",
												fontSize: 14,
												fontWeight: v.is_activated ? 600 : "initial",
											}}
										>
											{v.is_activated ? "Active" : "Inactive"}
										</Typography>
										<Stack direction={"row"} justifyContent={"space-between"}>
											<Typography
												variant="h5"
												component={"div"}
												onClick={() => {
													setSelectedBlockGroup(v);
													setIsCoveredState(v.is_covered);
													setIsGrayscaledState(v.is_grayscaled);
													setIsMutedState(v.is_muted);
													openModal(v);
												}}
												sx={{
													color: "#424242",
													"&:hover": { color: "#229799" },
													transition: "all 0.15s ease-in-out",
													cursor: "pointer",
													width: "fit-content",
													fontWeight: 600,
												}}
												pr={2}
												py={"2px"}
											>
												{v.group_name}
											</Typography>
											<div style={{ display: "inline-block" }}>
												<Switch
													checked={Boolean(v.is_activated)}
													size="medium"
													onChange={(
														e: React.ChangeEvent<HTMLInputElement>,
													) => {
														ipcRendererSend("blockgroup/set", {
															group: {
																...v,
																is_activated: e.target.checked ? 1 : 0,
															},
														});
														ipcRendererSend("blockgroup/get", {});
													}}
												/>
											</div>
										</Stack>
									</CardContent>
									<CardActions sx={{ flex: 1 }}>
										<Stack
											direction={{ xs: "column", sm: "row" }}
											spacing={1}
											sx={{
												width: "100%",
											}}
										>
											<Button
												size="small"
												variant="outlined"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v);
													setIsDeleteGroupModalOpen(true);
												}}
												sx={menuButtonStyle}
											>
												Delete
											</Button>
											<Button
												size="small"
												variant="outlined"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v);
													setIsRenameGroupModalOpen(true);
												}}
												sx={menuButtonStyle}
											>
												Rename
											</Button>
											<Button
												variant="text"
												color="primary"
												disableRipple
												sx={menuButtonStyle}
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v);
													setIsConfigModalOpen(true);
												}}
											>
												Blocking config
											</Button>
											{/* <Button
												disabled={v.lock_type !== null}
												variant="text"
												size="small"
												disableRipple
												color="secondary"
												sx={menuButtonStyle}
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v.id);
													ipcRendererSend("blockgroup/get/usage", { id: v.id });
													setUsageLimitModalOpen(true);
												}}
											>
												Usage limit{" "}
												{v.usage_time_left === null
													? "(not set)"
													: v.lock_type === null
														? "(locked)"
														: null}
											</Button> */}
										</Stack>
									</CardActions>
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

						zIndex: 100,
						fontWeight: 600,
					}}
				>
					<AddIcon /> Add group
				</Fab>
			</Stack>
			<BlockingModal />
			<NewBlockGroupModal />
			<DeleteBlockGroupModal />
			<RenameBlockGroupModal />
			<ConfigModal />
			{/* <UsageLimitModal /> */}
		</>
	);
}
