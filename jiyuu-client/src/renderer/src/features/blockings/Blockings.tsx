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
} from "@mui/material";
import { ipcRendererOn, ipcRendererSend } from "./blockingAPI";

export default function Blockings(): React.JSX.Element {
	const {
		blockGroupData,
		blockedSitesData,
		targetTextInput,
		setblockGroupData,
		setTargetTextInput,
		setblockedSitesData,
		groupIdInput,
		setGroupIdInput,
	} = useStore();

	const targetTextPut = (): void => {
		ipcRendererOn("targettext/put/response", (event, data) => {
			if (data.error)
				console.error("putting target text response: ", data.error);
			else console.info("inserting data success");
		});

		ipcRendererSend("targettext/put", {
			target_text: targetTextInput,
			group_id: groupIdInput,
		});
	};

	useEffect(() => {
		// RECEIVE BLOCK GROUP RESPONSE
		ipcRendererOn("blockgroup/get/response", (event, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setblockGroupData(data.data);
		});

		// GET ALL BLOCK GROUP
		ipcRendererSend("blockgroup/get", {});

		// RECEIVE BLOCK SITE RESPONSE
		ipcRendererOn("blockedsites/get/response", (event, data) => {
			if (data.error) console.error("Error fetching group block: ", data.error);
			setblockedSitesData(data.data);
		});

		// GET ALL BLOCK SITE
		ipcRendererSend("blockedsites/get", {});
	}, []);

	return (
		<>
			<Stack>
				{blockGroupData.map((v: BlockGroup, i) => {
					return (
						<Card sx={{ maxWidth: 345 }} key={`${v.id} - ${i}`}>
							<Box sx={{ backgroundColor: "#b5d9a3", height: 100 }}></Box>
							<CardContent>
								<Typography gutterBottom variant="h5" component={"div"}>
									{v.group_name}
								</Typography>
							</CardContent>
						</Card>
					);
				})}
			</Stack>
			{blockedSitesData.map((v: BlockedSites, i) => {
				console.log(`${v.target_text} - ${i} - ${v.block_group_id}`);

				return (
					<div key={`${v.target_text} - ${i} - ${v.block_group_id}`}>
						{v.target_text} <br />
						{v.block_group_id}
					</div>
				);
			})}
			<Typography>{targetTextInput}</Typography>
			<TextField
				type="text"
				value={targetTextInput}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					console.log();
					setTargetTextInput(event.target.value);
				}}
			/>
			{/* <Typography>{groupIdInput}</Typography>
			<TextField
				value={groupIdInput}
				onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
					setGroupIdInput(event.target.value);
				}}
			/> */}
			<Button onClick={targetTextPut} type="button" color="primary">
				Submit Text
			</Button>
		</>
	);
}
