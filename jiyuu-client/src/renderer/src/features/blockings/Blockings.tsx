/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useEffect } from "react";
import { BlockedSites, BlockGroup, useStore } from "./blockingsStore";
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

export default function Blockings(): React.JSX.Element {
	const {
		blockGroupData,
		blockedSitesData,
		targetTextInput,
		setblockGroupData,
		setTargetTextInput,
		setblockedSitesData,
		selectedBlockGroup,
		setSelectedBlockGroup,
	} = useStore();

	useEffect(() => {
		ipcRendererOn("blockedsites/put/response", (event, data) => {
			if (data.error)
				console.error("putting target text response: ", data.error);
			else console.info("inserting data success");
		});

		// RECEIVE BLOCK GROUP RESPONSE
		ipcRendererOn("blockgroup/get/response", (event, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setblockGroupData(data.data);
		});

		// RECEIVE BLOCK SITE RESPONSE
		ipcRendererOn("blockedsites/get/response", (event, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setblockedSitesData(data.data);
		});

		// GET ALL BLOCK GROUP (INITIALIZATION)
		ipcRendererSend("blockgroup/get", { init: true });

		// GET ALL BLOCK SITE
		ipcRendererSend("blockedsites/get", { init: true });
	}, []);

	return (
		<>
			<Stack>
				{blockGroupData.map((v: BlockGroup, i) => {
					// console.log(v);

					return (
						<Card
							// sx={{ maxWidth: 345 }}
							sx={{ borderRadius: 0 }}
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
									onClick={() => {
										// GET BLOCK SITE OF SPECIFIC BLOCK GROUP
										ipcRendererSend("blockedsites/get", {
											id: v.id,
											group_name: v.group_name,
										});

										setSelectedBlockGroup(v.id);
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
							</CardContent>
							<CardActions>
								<Button size="small" onClick={(e) => e.stopPropagation()}>
									Delete
								</Button>
								<Button size="small" onClick={(e) => e.stopPropagation()}>
									Rename
								</Button>
								<Button size="small" onClick={(e) => e.stopPropagation()}>
									Duplicate
								</Button>
							</CardActions>
						</Card>
					);
				})}
			</Stack>
			{/* <Typography>{groupIdInput}</Typography>
			<TextField
				value={groupIdInput}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setGroupIdInput(event.target.value);
				}}
			/> */}
			<BlockingModal />
		</>
	);
}
