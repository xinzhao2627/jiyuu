import { Box, Button, Modal, TextField, Typography } from "@mui/material";
import { useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	border: "2px solid #000",
	boxShadow: 24,
	p: 4,
	color: "black",
};
export default function BlockingModal(): React.JSX.Element {
	const {
		selectedBlockGroup,
		setSelectedBlockGroup,
		blockedSitesData,
		targetTextInput,
		setTargetTextInput,
	} = useStore();
	const targetTextPut = (): void => {
		ipcRendererSend("blockedsites/put", {
			target_text: targetTextInput,
			group_id: selectedBlockGroup,
		});
	};
	return (
		<Modal
			open={Boolean(selectedBlockGroup)}
			onClose={() => setSelectedBlockGroup(null)}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				{blockedSitesData.map((v, i) => {
					return (
						<Typography
							variant="h6"
							component={"h2"}
							key={`${v.block_group_id} - ${v.target_text} - ${i}`}
						>
							{v.target_text}
						</Typography>
					);
				})}
				<Typography>target text: {targetTextInput}</Typography>
				<TextField
					type="text"
					value={targetTextInput}
					onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
						console.log();
						setTargetTextInput(event.target.value);
					}}
				/>
				<Button onClick={targetTextPut} type="button" color="primary">
					Submit Text
				</Button>
			</Box>
		</Modal>
	);
}
