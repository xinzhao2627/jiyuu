/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useEffect } from "react";
import {
	BlockedSites,
	BlockGroup,
	menuButtonStyle,
	useStore,
} from "./blockingsStore";
import {
	Button,
	Card,
	Stack,
	TextField,
	Typography,
	Box,
	CardContent,
	CardActions,
} from "@mui/material";
import { ipcRendererOn, ipcRendererSend } from "./blockingAPI";
import BlockingModal from "./components/blockingModal";
import { ipcRenderer } from "electron";
import { windowsStore } from "process";
import NewBlockGroupModal from "./components/newBlockGroupModal";

export default function Blockings(): React.JSX.Element {
	const {
		blockGroupData,
		blockedSitesData,
		targetTextInput,
		setBlockGroupData,
		setTargetTextInput,
		setBlockedSitesData,
		selectedBlockGroup,
		setSelectedBlockGroup,
		setIsCoveredState,
		setIsGrayscaledState,
		setIsMutedState,
		setIsNewGroupModalOpen,
	} = useStore();

	const openModal = (v: BlockGroup): void => {
		// GET BLOCK SITE OF SPECIFIC BLOCK GROUP
		ipcRendererSend("blockedsites/get", {
			id: v.id,
			group_name: v.group_name,
		});
	};

	useEffect(() => {
		ipcRendererOn("blockedsites/put/response", (event, data) => {
			if (data.error)
				console.error("putting target text response: ", data.error);
			else console.info("inserting data success");
		});

		// RECEIVE BLOCK GROUP RESPONSE
		ipcRendererOn("blockgroup/get/response", (event, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setBlockGroupData(data.data);
		});

		// RECEIVE BLOCK SITE RESPONSE
		ipcRendererOn("blockedsites/get/response", (event, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setBlockedSitesData(data.data);
			console.log("Bsite data: ", data.data);
			if (data.blockGroupSettings) {
				const settings = data.blockGroupSettings;
				console.log("Bsite Settings: ", settings);
				setSelectedBlockGroup(settings.id);
				setIsCoveredState(Boolean(settings.is_covered));
				setIsMutedState(Boolean(settings.is_muted));
				setIsGrayscaledState(Boolean(settings.is_grayscaled));
			}
		});

		// GET ALL BLOCK GROUP (INITIALIZATION)
		ipcRendererSend("blockgroup/get", { init: true });

		// // GET ALL BLOCK SITE
		// ipcRendererSend("blockedsites/get", { init: true });

		// SETTING ALL BLOCK GROUP DATA AND BLOCKED SITES DATA response
		ipcRendererOn(
			"BlockGroupAndBlockedSitesData/set/response",
			(event, data) => {
				if (data.error)
					console.error("ERROR MODIFYING THE ENTIRE GORUP: ", data.error);
				else console.info("MODIFYING THE ENTIRE GROUP SUCCESS");
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
		};
	}, []);

	return (
		<>
			<Stack>
				{blockGroupData.map((v: BlockGroup, i) => {
					// console.log(v);

					return (
						<Card
							// sx={{ maxWidth: 345 }}
							sx={{
								borderRadius: 0,
								padding: 1,
								marginBottom: "2px",
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
							</CardContent>
							<CardActions>
								<Button
									size="small"
									onClick={(e) => e.stopPropagation()}
									sx={menuButtonStyle}
								>
									Delete
								</Button>
								<Button
									size="small"
									onClick={(e) => e.stopPropagation()}
									sx={menuButtonStyle}
								>
									Rename
								</Button>
								<Button
									size="small"
									onClick={(e) => e.stopPropagation()}
									sx={menuButtonStyle}
								>
									Duplicate
								</Button>
							</CardActions>
						</Card>
					);
				})}
				<div style={{ textAlign: "center", marginTop: "2em" }}>
					<Button
						onClick={() => setIsNewGroupModalOpen(true)}
						variant="contained"
						color="primary"
						sx={{
							textTransform: "none",
							width: "fit-content",
							padding: 1,
							fontWeight: 600,
							letterSpacing: 0.5,
						}}
					>
						Add block group
					</Button>
				</div>
			</Stack>
			{/* <Typography>{groupIdInput}</Typography>
			<TextField
				value={groupIdInput}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setGroupIdInput(event.target.value);
				}}
			/> */}
			<BlockingModal />
			<NewBlockGroupModal />
		</>
	);
}
