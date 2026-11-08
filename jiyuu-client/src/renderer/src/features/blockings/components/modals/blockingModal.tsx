import {
	Box,
	Button,
	Chip,
	IconButton,
	Modal,
	Stack,
	SxProps,
	TextField,
	ToggleButton,
	ToggleButtonGroup,
	Tooltip,
	Typography,
} from "@mui/material";
import { menuButtonStyle, useStore } from "../../blockingsStore";
import { ipcRendererSend } from "../../blockingAPI";
import ClearIcon from "@mui/icons-material/Clear";
import toast from "react-hot-toast";
import { Theme } from "@mui/material";
import { useRef } from "react";
import { blocked_content } from "@renderer/jiyuuInterfaces";
import { scrollbarStyle } from "@renderer/assets/shared/modalStyle";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

const modalStyle = {
	position: "absolute" as const,
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "calc(100vw - 24px)", md: "72%" },
	maxWidth: 760,
	maxHeight: "calc(100vh - 32px)",
	bgcolor: "background.paper",
	boxShadow: "none",
	color: "text.primary",
	outline: "none",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: 1.5,
	overflow: "hidden",
};

const toggleButtonStyle: SxProps<Theme> = {
	borderRadius: 0,
	py: 1,
	fontSize: 13,
	fontWeight: 600,
	textTransform: "none",
	letterSpacing: 0,
	border: "none",
	borderRight: "1px solid",
	borderColor: "divider",
	"&:last-child": {
		borderRight: "none",
	},
	"&.Mui-selected": {
		color: "primary.contrastText",
		backgroundColor: "primary.main",
		"&:hover": {
			backgroundColor: "primary.dark",
		},
	},
	"&:hover": {
		backgroundColor: "action.hover",
	},
	transition: "background-color .15s ease, color .15s ease",
};

const keywordFlagButtonSx: SxProps<Theme> = {
	px: 1.5,
	height: 38,
	borderRadius: 1,
	textTransform: "none",
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: 0,
	border: "1px solid",
	borderColor: "divider",
	color: "text.secondary",
	bgcolor: "background.default",
	minWidth: 0,
	"&.Mui-selected": {
		bgcolor: "primary.main",
		color: "primary.contrastText",
		borderColor: "primary.main",
		"&:hover": { bgcolor: "primary.dark" },
	},
	"&:hover": { bgcolor: "action.hover" },
};

const chipSx: SxProps<Theme> = {
	height: 20,
	fontSize: 10,
	fontWeight: 700,
};

export default function BlockingModal(): React.JSX.Element {
	const {
		blockGroup,
		setSelectedBlockGroup,
		blockedContent,
		setBlockedContentData,
		setBlockedContentInput,
		setBlockedContentState,
		setBlockGroupModal,
	} = useStore();

	const inputFile = useRef<HTMLInputElement>(null);

	const targetTextPut = (): void => {
		const text = blockedContent.input.text.trim();
		if (!text) return;

		if (
			blockedContent.data.some(
				(v) =>
					v.target_text.toLowerCase() === text.toLowerCase() &&
					v.block_group_id === blockGroup.selectedBlockGroup?.id,
			)
		) {
			toast.error("Target already exists in this group");
			return;
		}

		if (!blockGroup.selectedBlockGroup) {
			toast.error("There was a problem adding content for this group");
			return;
		}

		setBlockedContentData([
			{
				block_group_id: blockGroup.selectedBlockGroup.id,
				target_text: text,
				is_absolute: (blockedContent.input.is_absolute ? 1 : 0) as 0 | 1,
			},
			...blockedContent.data,
		]);

		setBlockedContentInput({
			text: "",
			is_absolute: blockedContent.input.is_absolute,
		});
	};

	const handleClose = (): void => {
		setSelectedBlockGroup(null);
		setBlockGroupModal("blockingModal", false);
		setBlockedContentState("blurred", null);
		setBlockedContentState("grayscaled", null);
		setBlockedContentState("muted", null);
		setBlockedContentState("covered", null);
		setBlockedContentInput({
			text: "",
			is_absolute: false,
		});
		setBlockedContentData([]);
	};

	const saveNewBlockGroup_and_BlockedContentData = (): void => {
		ipcRendererSend("blockgroup_blockedcontent/set", {
			group: {
				...blockGroup.selectedBlockGroup,
				is_grayscaled: blockedContent.states.grayscaled?.val ? 1 : 0,
				is_covered: blockedContent.states.covered?.val ? 1 : 0,
				is_muted: blockedContent.states.muted?.val ? 1 : 0,
				is_blurred: blockedContent.states.blurred?.val ? 1 : 0,
			},
			blocked_content_data: blockedContent.data,
		});
	};

	return (
		<Modal
			open={
				blockGroup.modal.blockingModal && Boolean(blockGroup.selectedBlockGroup)
			}
			onClose={handleClose}
		>
			<Box sx={modalStyle}>
				{/* Top Restriction Modes Strip */}
				<Stack borderBottom="1px solid" borderColor="divider">
					<ToggleButtonGroup fullWidth>
						<ToggleButton
							value="covered"
							selected={blockedContent.states.covered?.val}
							disabled={
								Boolean(blockGroup.selectedBlockGroup?.restriction_type) &&
								blockedContent.states.covered?.init_val
							}
							onClick={() =>
								setBlockedContentState("covered", {
									init_val: blockedContent.states.covered?.init_val,
									val: !blockedContent.states.covered?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Covered
						</ToggleButton>
						<ToggleButton
							value="grayscaled"
							selected={blockedContent.states.grayscaled?.val}
							disabled={
								Boolean(blockGroup.selectedBlockGroup?.restriction_type) &&
								blockedContent.states.grayscaled?.init_val
							}
							onClick={() =>
								setBlockedContentState("grayscaled", {
									init_val: blockedContent.states.grayscaled?.init_val,
									val: !blockedContent.states.grayscaled?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Grayscaled
						</ToggleButton>
						<ToggleButton
							value="muted"
							selected={blockedContent.states.muted?.val}
							disabled={
								Boolean(blockGroup.selectedBlockGroup?.restriction_type) &&
								blockedContent.states.muted?.init_val
							}
							onClick={() =>
								setBlockedContentState("muted", {
									init_val: blockedContent.states.muted?.init_val,
									val: !blockedContent.states.muted?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Muted
						</ToggleButton>
						<ToggleButton
							value="blurred"
							selected={blockedContent.states.blurred?.val}
							disabled={
								Boolean(blockGroup.selectedBlockGroup?.restriction_type) &&
								blockedContent.states.blurred?.init_val
							}
							onClick={() =>
								setBlockedContentState("blurred", {
									init_val: blockedContent.states.blurred?.init_val,
									val: !blockedContent.states.blurred?.val,
								})
							}
							sx={toggleButtonStyle}
						>
							Blurred
						</ToggleButton>
					</ToggleButtonGroup>
				</Stack>

				{/* Modal Content */}
				<Box sx={{ p: { xs: 2, sm: 2.5 } }}>
					{/* Input & Action Bar */}
					<Stack direction="row" gap={1} mb={2} alignItems="center">
						<TextField
							size="small"
							type="text"
							placeholder="Add website or keyword (e.g. reddit.com/r/funny)"
							value={blockedContent.input.text}
							onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
								setBlockedContentInput({
									text: event.target.value,
									is_absolute: blockedContent.input.is_absolute,
								});
							}}
							fullWidth
							onKeyDown={(e) => {
								if (e.key === "Enter") {
									e.preventDefault();
									targetTextPut();
								}
							}}
						/>

						<Tooltip title="Exact URL match instead of partial keyword match">
							<ToggleButtonGroup
								value={[
									blockedContent.input.is_absolute ? "absolute" : null,
								].filter(Boolean)}
								onChange={(_, values: string[]) => {
									setBlockedContentInput({
										text: blockedContent.input.text,
										is_absolute: values.includes("absolute"),
									});
								}}
								aria-label="exact match flag"
							>
								<ToggleButton
									value="absolute"
									sx={keywordFlagButtonSx}
									size="small"
								>
									Absolute
								</ToggleButton>
							</ToggleButtonGroup>
						</Tooltip>

						<input
							type="file"
							accept=".txt"
							ref={inputFile}
							style={{ display: "none" }}
							onChange={(e) => {
								const { files } = e.target;
								if (files && files.length) {
									const file = files[0];
									if (file.name.endsWith(".txt")) {
										const reader = new FileReader();
										reader.onload = (event) => {
											const content = event.target?.result as string;
											if (!blockGroup.selectedBlockGroup) return;

											const lines = content
												.split(/\r?\n/)
												.filter((l) => l.trim().length > 0)
												.map((l) => {
													const sl = l.trim().toLowerCase();
													const is_abs = sl.substring(0, 3) === "{a}" ? 1 : 0;
													return {
														target_text: is_abs ? sl.slice(3) : sl,
														block_group_id: blockGroup.selectedBlockGroup?.id,
														is_absolute: (is_abs === 1 ? 1 : 0) as 0 | 1,
													};
												});

											const added: blocked_content[] = [];
											for (const line of lines) {
												if (
													!blockedContent.data.some(
														(c) =>
															c.target_text.toLowerCase() === line.target_text,
													)
												) {
													added.push({
														target_text: line.target_text,
														block_group_id: blockGroup.selectedBlockGroup.id,
														is_absolute: line.is_absolute,
													});
												}
											}
											setBlockedContentData([...blockedContent.data, ...added]);
											toast.success(`Imported ${added.length} targets`);
										};
										reader.readAsText(file);
									}
								}
							}}
						/>

						<Button
							variant="outlined"
							color="primary"
							sx={{
								...keywordFlagButtonSx,
								whiteSpace: "nowrap",
							}}
							onClick={() => inputFile.current?.click()}
						>
							Import
						</Button>
					</Stack>

					{/* Blocked Items List */}
					<Stack
						height={240}
						gap={0.75}
						overflow="auto"
						sx={{
							pr: 0.5,
							...scrollbarStyle,
						}}
					>
						{blockedContent.data.map((v, i) => (
							<Stack
								key={`${v.block_group_id} - ${v.target_text} - ${i}`}
								direction="row"
								alignItems="center"
								justifyContent="space-between"
								px={1.5}
								py={0.75}
								sx={{
									...uiStyles.listItemCard,
								}}
							>
								<Typography
									variant="body2"
									sx={{
										fontFamily: 'Consolas, "Roboto Mono", monospace',
										fontSize: "0.8125rem",
										overflow: "hidden",
										textOverflow: "ellipsis",
										whiteSpace: "nowrap",
										pr: 1,
									}}
								>
									{v.target_text}
								</Typography>

								<Stack direction="row" alignItems="center" spacing={1}>
									{Boolean(v.is_absolute) && (
										<Chip
											label="A"
											color="primary"
											variant="outlined"
											sx={chipSx}
											size="small"
										/>
									)}

									{!blockGroup.selectedBlockGroup?.restriction_type && (
										<IconButton
											size="small"
											aria-label="Remove"
											onClick={() => {
												setBlockedContentData(
													blockedContent.data.filter(
														(item) => item.target_text !== v.target_text,
													),
												);
											}}
											sx={{
												color: "text.secondary",
												"&:hover": { color: "error.main" },
											}}
										>
											<ClearIcon fontSize="small" />
										</IconButton>
									)}
								</Stack>
							</Stack>
						))}
					</Stack>

					{/* Bottom Actions */}
					<Stack direction="row" justifyContent="flex-end" gap={1} mt={2}>
						<Button
							variant="outlined"
							onClick={handleClose}
							sx={{ ...menuButtonStyle, fontWeight: 500 }}
						>
							Cancel
						</Button>
						<Button
							variant="contained"
							color="primary"
							onClick={() => {
								saveNewBlockGroup_and_BlockedContentData();
								handleClose();
							}}
							sx={{ ...menuButtonStyle, fontWeight: 500 }}
						>
							Save
						</Button>
					</Stack>
				</Box>
			</Box>
		</Modal>
	);
}
