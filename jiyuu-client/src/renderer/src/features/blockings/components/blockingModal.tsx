import {
	Box,
	Button,
	IconButton,
	Modal,
	Stack,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import { menuButtonStyle, useStore } from "../blockingsStore";
import { ipcRendererSend } from "../blockingAPI";
import ClearIcon from "@mui/icons-material/Clear";

const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: "70%",
	bgcolor: "background.paper",
	boxShadow: 24,
	color: "black",
	outline: "none",
};
export default function BlockingModal(): React.JSX.Element {
	const {
		selectedBlockGroup,
		setSelectedBlockGroup,
		blockedSitesData,
		setBlockedSitesData,
		targetTextInput,
		setTargetTextInput,
		isCoveredState,
		isGrayscaledState,
		isMutedState,
		setIsCoveredState,
		setIsGrayscaledState,
		setIsMutedState,
		setIsBlockingModalOpen,
		isBlockingModalOpen,
	} = useStore();
	const targetTextPut = (): void => {
		// when putting a new keyword in blockedsites list, check if it already exist
		if (
			blockedSitesData.some(
				(v) =>
					v.target_text.toLowerCase() === targetTextInput.toLowerCase() &&
					v.block_group_id === selectedBlockGroup?.id,
			)
		) {
			console.warn("Target text already exists in the list.");
		} else {
			setBlockedSitesData([
				...blockedSitesData,
				{ block_group_id: selectedBlockGroup, target_text: targetTextInput },
			]);
		}
	};
	const handleClose = (): void => {
		setSelectedBlockGroup(null);
		setIsBlockingModalOpen(false);
		setIsCoveredState(0);
		setIsGrayscaledState(0);
		setIsMutedState(0);
		setTargetTextInput("");
	};
	const saveNewBlockGroup_and_BlockedSitesData = (): void => {
		setSelectedBlockGroup({
			...selectedBlockGroup,
			is_grayscaled: isGrayscaledState,
			is_covered: isCoveredState,
			is_muted: isMutedState,
		});
		ipcRendererSend("blockgroup_blockedsites/set", {
			group: selectedBlockGroup,
			blocked_sites_data: blockedSitesData,
		});
		// refesh block group if needed (optional)
		// ipcRendererSend("blockgroup/get", {});
	};
	return (
		<Modal
			open={isBlockingModalOpen && Boolean(selectedBlockGroup)}
			onClose={handleClose}
			aria-labelledby="modal-modal-title"
			aria-describedby="modal-modal-description"
		>
			<Box sx={modalStyle}>
				<Stack>
					<ToggleButtonGroup fullWidth>
						<ToggleButton
							color="warning"
							value="covered"
							selected={Boolean(isCoveredState)}
							disableRipple
							onClick={() => setIsCoveredState(!isCoveredState)}
							sx={menuButtonStyle}
						>
							Covered
						</ToggleButton>
						<ToggleButton
							color="primary"
							value="grayscaled"
							disableRipple
							selected={Boolean(isGrayscaledState)}
							onClick={() => setIsGrayscaledState(!isGrayscaledState)}
							sx={menuButtonStyle}
						>
							Grayscaled
						</ToggleButton>
						<ToggleButton
							color="success"
							value="muted"
							disableRipple
							selected={Boolean(isMutedState)}
							onClick={() => setIsMutedState(!isMutedState)}
							sx={menuButtonStyle}
						>
							Muted
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>
				<div style={{ padding: "16px" }}>
					<Stack direction={"column"}>
						<TextField
							type="text"
							value={targetTextInput}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setTargetTextInput(event.target.value);
							}}
							label="Keyword"
							variant="standard"
							fullWidth
							onKeyDown={(e) => {
								if (e.key.toLowerCase() === "enter") {
									targetTextPut();
								}
							}}
						/>
						<Typography
							variant="caption"
							sx={{ marginBottom: 1 }}
							color="textSecondary"
						>
							Press enter to include this keyword
						</Typography>
					</Stack>
					<Stack padding={1} height={220} overflow={"auto"}>
						{blockedSitesData.map((v, i) => {
							return (
								<Stack
									key={`${v.block_group_id} - ${v.target_text} - ${i}`}
									direction={"row"}
								>
									<Typography
										variant="overline"
										width={"100%"}
										sx={{ ...menuButtonStyle, fontWeight: 500 }}
									>
										{v.target_text}
									</Typography>
									{/* remove the element */}
									<IconButton
										size="small"
										onClick={() => {
											setBlockedSitesData(
												blockedSitesData.filter((item) => {
													console.log(item);
													return item.target_text !== v.target_text;
												}),
											);
										}}
									>
										<ClearIcon />
									</IconButton>
								</Stack>
							);
						})}
					</Stack>
					<Stack direction={"row"} justifyContent={"end"} gap={1} marginTop={1}>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								saveNewBlockGroup_and_BlockedSitesData();
								handleClose();
							}}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="outlined"
							color="primary"
							onClick={handleClose}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Cancel
						</Button>
					</Stack>
				</div>
			</Box>
		</Modal>
	);
}
