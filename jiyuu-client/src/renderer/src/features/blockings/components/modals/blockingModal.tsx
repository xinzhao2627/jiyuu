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
import { Theme } from "@emotion/react";
import { useRef } from "react";
import { blocked_content } from "@renderer/jiyuuInterfaces";

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
const toggleButtonStyle: SxProps<Theme> = {
	borderRadius: "0px",
	"&.Mui-selected": {
		color: "white",
		backgroundColor: "#199473",
		"&:hover": {
			backgroundColor: "#15785D",
		},
	},
	"&:hover": {
		backgroundColor: "rgba(0, 0, 0, 0.04)",
	},
	transition:
		"background-color .18s ease, color .18s ease, box-shadow .18s ease",
};
const keywordFlagButtonSx: SxProps<Theme> = {
	px: 1.5,
	py: 0.75,
	borderRadius: 2,
	textTransform: "none",
	fontSize: 12,
	fontWeight: 600,
	letterSpacing: 0.7,
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
	height: 24,
	fontSize: 10,
	fontWeight: 600,
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
		// when putting a new keyword in blockedcontent list, check if it already exist
		if (
			blockedContent.data.some(
				(v) =>
					v.target_text.toLowerCase() ===
						blockedContent.input.text.toLowerCase() &&
					v.block_group_id === blockGroup.selectedBlockGroup?.id,
			)
		) {
			console.warn("Target text already exists in the list.");
		} else {
			if (!blockGroup.selectedBlockGroup) {
				toast.error("There was a problem adding a content for this group");
				console.error(blockGroup);
				return;
			}
			setBlockedContentData([
				{
					block_group_id: blockGroup.selectedBlockGroup.id,
					target_text: blockedContent.input.text,
					// TODO
					is_absolute: blockedContent.input.is_absolute ? 1 : 0,
				},
				...blockedContent.data,
			]);
		}
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
				<Stack>
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
				<div style={{ padding: "16px" }}>
					<Stack direction={"column"}>
						<Stack direction={"row"} alignItems="center" gap={2}>
							<TextField
								type="text"
								value={blockedContent.input.text}
								onChange={(event: React.ChangeEvent<HTMLInputElement>) => {
									setBlockedContentInput({
										text: event.target.value,
										is_absolute: blockedContent.input.is_absolute,
									});
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
							<Stack>
								<input
									type="file"
									accept=".txt"
									ref={inputFile}
									style={{ display: "none" }}
									onChange={(e) => {
										const { files } = e.target;
										if (files && files.length) {
											const file = files[0];
											const filename = files[0].name;
											const p = filename.split(".");
											const fileType = p[p.length - 1];

											if (fileType === "txt") {
												console.log("file is txt");

												const reader = new FileReader();

												reader.onload = (event) => {
													const c = event.target?.result as string;
													// console.log("c", c);

													if (!blockGroup.selectedBlockGroup) {
														toast.error(
															"There was a problem adding a content for this group",
														);
														console.error(blockGroup);
														return;
													}
													const lines = c
														.split(/\r?\n/)
														.filter((l) => l.length > 0)
														.map((l) => {
															const sl = l.trim().toLowerCase();
															const is_abs =
																sl.substring(0, 3) === "{a}" ? 1 : 0;
															return {
																target_text: is_abs ? sl.slice(3) : sl,
																block_group_id:
																	blockGroup.selectedBlockGroup?.id,
																is_absolute: is_abs,
															};
														});

													const added_text: Array<blocked_content> = [];
													for (let i = 0; i < lines.length; i++) {
														// console.log(lines[0]);

														const cdata = blockedContent.data;
														// if its alread in the list of this particular group, skip it.
														if (
															cdata.some(
																(c) =>
																	c.target_text.toLocaleLowerCase() ===
																		lines[i].target_text &&
																	c.block_group_id ===
																		blockGroup.selectedBlockGroup?.id,
															)
														) {
															continue;
														}
														added_text.push({
															target_text: lines[i].target_text,
															block_group_id: blockGroup.selectedBlockGroup?.id,
															is_absolute: lines[i].is_absolute === 0 ? 0 : 1,
														});
													}
													setBlockedContentData([
														...blockedContent.data,
														...added_text,
													]);
												};
												reader.readAsText(file);
											}
										}
									}}
								/>
								<Button
									variant="text"
									color="primary"
									sx={{
										...keywordFlagButtonSx,
										height: "2em",
										mb: 0.5,
										fontWeight: 500,
									}}
									onClick={() => {
										inputFile?.current?.click();
									}}
								>
									Import
								</Button>
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
									aria-label="keyword flags"
									style={{
										alignItems: "center",
										alignContent: "center",
										height: "100%",
									}}
								>
									<Tooltip title="Absolute (exact match – doesn't use partial contains)">
										<ToggleButton
											value="absolute"
											sx={keywordFlagButtonSx}
											size="small"
										>
											Absolute
										</ToggleButton>
									</Tooltip>
								</ToggleButtonGroup>
							</Stack>
						</Stack>
						<Typography
							variant="caption"
							sx={{ marginBottom: 1 }}
							color="textSecondary"
						>
							Press Enter to add a keyword or a website{" "}
							{"(e.g: facebook.com/reel | r/funny)"}
						</Typography>
					</Stack>
					<Stack
						padding={1}
						height={220}
						overflow={"auto"}
						sx={{
							pr: 0.5,
							scrollbarWidth: "thin", // Firefox
							"&::-webkit-scrollbar": {
								width: 8,
							},
							"&::-webkit-scrollbar-track": {
								background: "transparent",
								borderRadius: 8,
							},
							"&::-webkit-scrollbar-thumb": {
								borderRadius: 8,
								border: "2px solid transparent",
								backgroundClip: "content-box",
							},
							"&::-webkit-scrollbar-thumb:hover": {
								backgroundColor: "#19947380",
							},
							"&::-webkit-scrollbar-thumb:active": {
								backgroundColor: "#199473CC",
							},
							"&:hover::-webkit-scrollbar-thumb": {
								backgroundColor: "#19947360",
							},
						}}
					>
						{blockedContent.data.map((v, i) => {
							return (
								<Stack
									key={`${v.block_group_id} - ${v.target_text} - ${i}`}
									direction={"row"}
								>
									<Stack direction={"row"} width={"100%"}>
										<Typography
											variant="overline"
											width={"100%"}
											sx={{ ...menuButtonStyle, fontWeight: 500 }}
										>
											{v.target_text}
										</Typography>
										{Boolean(v.is_absolute) && (
											<Chip
												label="A"
												color="primary"
												variant="outlined"
												sx={{
													...chipSx,
													color: "primary.main",
													borderColor: "primary.main",
												}}
												size="small"
											/>
										)}
									</Stack>

									{/* remove the element */}
									{!blockGroup.selectedBlockGroup?.restriction_type && (
										<IconButton
											size="small"
											onClick={() => {
												setBlockedContentData(
													blockedContent.data.filter((item) => {
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
								saveNewBlockGroup_and_BlockedContentData();
								handleClose();
							}}
							sx={{ ...menuButtonStyle, fontWeight: 400 }}
						>
							Save
						</Button>
						<Button
							variant="text"
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
