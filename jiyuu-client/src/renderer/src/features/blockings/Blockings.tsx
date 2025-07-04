/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useEffect } from "react";
import { BlockGroup, menuButtonStyle, useStore } from "./blockingsStore";
import toast, { Toaster } from "react-hot-toast";
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
		setRenameOldGroupName,
	} = useStore();

	const openModal = (v: BlockGroup): void => {
		// GET BLOCK SITE OF SPECIFIC BLOCK GROUP
		ipcRendererSend("blockedsites/get", {
			id: v.id,
			group_name: v.group_name,
		});
	};

	useEffect(() => {
		ipcRendererOn("blockedsites/put/response", (_, data) => {
			if (data.error)
				console.error("putting target text response: ", data.error);
			else console.info("inserting data success");
		});

		// RECEIVE BLOCK GROUP RESPONSE
		ipcRendererOn("blockgroup/get/response", (_, data) => {
			if (data.error)
				console.error("Error blockgroup/get/response: ", data.error);
			setBlockGroupData(data.data);
		});
		// RECEIVE BLOCK GROUP RENAME RESPONSE
		ipcRendererOn("blockgroup/rename/response", (_, data) => {
			if (data.error) {
				console.error("Error blockgroup/rename/response: ", data.error);
				toast.error(data.error);
			} else if (data.info) toast.success(data.info);
		});
		// RECEIVE BLOCK GROUP CREATE/PUT RESPONSE (when you create a block  group)
		ipcRendererOn("blockgroup/put/response", (_, data) => {
			if (data.error) {
				console.error("Error blockgroup/get/response: ", data.error);
				toast.error(data.error);
			} else if (data.info) toast.success(data.info);
		});

		ipcRendererOn("blockgroup/set/isactivated/response", (_, data) => {
			if (data.error) {
				console.error(
					"blockgroup/set/isactivated/response error: ",
					data.error,
				);
			} else console.info("is_activated setup of a block group success");
		});

		// RECEIVE BLOCK SITE RESPONSE
		ipcRendererOn("blockedsites/get/response", (_, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setBlockedSitesData(data.data);
			console.log("Bsite data: ", data.data);
			if (data.blockGroupSettings) {
				const settings = data.blockGroupSettings;
				console.log("Bsite Settings: ", settings);

				// set all the values of the selected blockgroup
				setSelectedBlockGroup(settings.id);
				setIsCoveredState(Boolean(settings.is_covered));
				setIsMutedState(Boolean(settings.is_muted));
				setIsGrayscaledState(Boolean(settings.is_grayscaled));

				// also show the modal itself
				setIsBlockingModalOpen(true);
			}
		});

		// GET ALL BLOCK GROUP (INITIALIZATION)
		ipcRendererSend("blockgroup/get", { init: true });

		// // GET ALL BLOCK SITE
		// ipcRendererSend("blockedsites/get", { init: true });

		// SETTING ALL BLOCK GROUP DATA AND BLOCKED SITES DATA response
		ipcRendererOn("BlockGroupAndBlockedSitesData/set/response", (_, data) => {
			if (data.error)
				console.error("ERROR MODIFYING THE ENTIRE GORUP: ", data.error);
			else if (data.info) toast.success(data.info);
		});

		// gets a reply when deleting a block group
		ipcRendererOn(
			"BlockGroupAndBlockedSitesData/delete/response",
			(_, data) => {
				if (data.error) {
					console.error("Error deleting a block group: ", data.error);
					toast.error(data.error);
				} else if (data.info) toast.success(data.info);
			},
		);

		return () => {
			window.electron.ipcRenderer.removeAllListeners("blockgroup/get/response");

			window.electron.ipcRenderer.removeAllListeners(
				"blockedsites/get/response",
			);
			window.electron.ipcRenderer.removeAllListeners(
				"blockedsites/put/response",
			);

			window.electron.ipcRenderer.removeAllListeners(
				"BlockGroupAndBlockedSitesData/set/response",
			);
			window.electron.ipcRenderer.removeAllListeners(
				"BlockGroupAndBlockedSitesData/delete/response",
			);
			window.electron.ipcRenderer.removeAllListeners(
				"blockgroup/set/isactivated/response",
			);
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
						"&::-webkit-scrollbar": {
							width: "6px",
						},
						"&::-webkit-scrollbar-track": {
							backgroundColor: "transparent",
						},
						"&::-webkit-scrollbar-thumb": {
							backgroundColor: "#d0d0d0",
							borderRadius: "3px",
						},
						"&::-webkit-scrollbar-thumb:hover": {
							backgroundColor: "#b0b0b0",
						},
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
												onClick={() => openModal(v)}
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

											<Switch
												checked={Boolean(v.is_activated)}
												size="medium"
												onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
													ipcRendererSend("blockgroup/set/isactivated", {
														group_id: v.id,
														is_activated: e.target.checked,
													});
													ipcRendererSend("blockgroup/get", {});
												}}
											/>
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
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v.id);
													setIsDeleteGroupModalOpen(true);
												}}
												sx={menuButtonStyle}
											>
												Delete
											</Button>
											<Button
												size="small"
												onClick={(e) => {
													e.stopPropagation();
													setSelectedBlockGroup(v.id);
													setIsRenameGroupModalOpen(true);
													setRenameOldGroupName(v.group_name);
												}}
												sx={menuButtonStyle}
											>
												Rename
											</Button>
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
					onClick={() => setIsNewGroupModalOpen(true)}
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
			<Toaster
				position="top-center"
				toastOptions={{
					className: "roboto-toast",
					duration: 1200,
					style: {
						fontWeight: "600",
					},
				}}
			/>
		</>
	);
}
