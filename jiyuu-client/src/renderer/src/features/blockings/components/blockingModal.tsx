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
import { teal } from "@mui/material/colors";

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
const toggleButtonStyle = {
	"&.Mui-selected": {
		color: teal[500],
		backgroundColor: teal[50],
		"&:hover": {
			backgroundColor: "rgba(0, 150, 136, 0.15)",
		},
	},
	"&:hover": {
		backgroundColor: "rgba(0, 0, 0, 0.04)",
	},
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
		isBlurredState,
		setIsBlurredState,
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
				{
					block_group_id: selectedBlockGroup?.id,
					target_text: targetTextInput,
				},
			]);
		}
	};
	const handleClose = (): void => {
		setSelectedBlockGroup(null);
		setIsBlockingModalOpen(false);
		setIsCoveredState(false);
		setIsGrayscaledState(false);
		setIsBlurredState(false);
		setIsMutedState(false);
		setTargetTextInput("");
		setBlockedSitesData([]);
	};
	const saveNewBlockGroup_and_BlockedSitesData = (): void => {
		ipcRendererSend("blockgroup_blockedsites/set", {
			group: {
				...selectedBlockGroup,
				is_grayscaled: isGrayscaledState?.val ? 1 : 0,
				is_covered: isCoveredState?.val ? 1 : 0,
				is_muted: isMutedState?.val ? 1 : 0,
				is_blurred: isBlurredState?.val ? 1 : 0,
			},
			blocked_sites_data: blockedSitesData,
		});
	};
	return (
		<Modal
			open={isBlockingModalOpen && Boolean(selectedBlockGroup)}
			onClose={handleClose}
		>
			<Box sx={modalStyle}>
				<Stack>
					<ToggleButtonGroup fullWidth>
						<ToggleButton
							value="covered"
							selected={isCoveredState?.val}
							disabled={
								Boolean(selectedBlockGroup?.restriction_type) &&
								isCoveredState?.init_val
							}
							onClick={() =>
								setIsCoveredState({
									...isCoveredState,
									val: !isCoveredState?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Covered
						</ToggleButton>
						<ToggleButton
							value="grayscaled"
							selected={isGrayscaledState?.val}
							disabled={
								Boolean(selectedBlockGroup?.restriction_type) &&
								isGrayscaledState?.init_val
							}
							onClick={() =>
								setIsGrayscaledState({
									...isGrayscaledState,
									val: !isGrayscaledState?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Grayscaled
						</ToggleButton>
						<ToggleButton
							value="muted"
							selected={isMutedState?.val}
							disabled={
								Boolean(selectedBlockGroup?.restriction_type) &&
								isMutedState?.init_val
							}
							onClick={() =>
								setIsMutedState({ ...isMutedState, val: !isMutedState?.val })
							}
							sx={toggleButtonStyle}
						>
							Muted
						</ToggleButton>
						<ToggleButton
							value="blurred"
							selected={isBlurredState?.val}
							disabled={
								Boolean(selectedBlockGroup?.restriction_type) &&
								isBlurredState?.init_val
							}
							onClick={() =>
								setIsBlurredState({
									...isBlurredState,
									val: !isBlurredState?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Blurred
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
									{!selectedBlockGroup?.restriction_type && (
										<IconButton
											size="small"
											onClick={() => {
												setBlockedSitesData(
													blockedSitesData.filter((item) => {
														return item.target_text !== v.target_text;
													}),
												);
											}}
										>
											<ClearIcon />
										</IconButton>
									)}
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
