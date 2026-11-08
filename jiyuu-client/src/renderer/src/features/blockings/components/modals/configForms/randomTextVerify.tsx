import * as React from "react";
import { useStore } from "@renderer/features/blockings/blockingsStore";
import { FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import { FormInterface, quickUnlock } from "./quickFunctions";
import { BlockGroup_Full } from "@renderer/jiyuuInterfaces";
import {
	Typography,
	Button,
	Stack,
	TextField,
	Box,
	LinearProgress,
} from "@mui/material";
import LockOpenOutlinedIcon from "@mui/icons-material/LockOpenOutlined";
import SpellcheckOutlinedIcon from "@mui/icons-material/SpellcheckOutlined";

const randomTextUnlock = (
	fv: FieldValues,
	randomTextContent: string,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const text = fv.randomTextContent?.trim();
		if (!text || !randomTextContent) {
			toast.error("Please enter the challenge text");
			return;
		}
		if (text === randomTextContent) {
			quickUnlock({ config_type: "randomText" }, selectedBlockGroup);
			toast.success("Restriction unlocked");
			handleClose();
		} else {
			toast.error("Characters do not match. Try again.");
		}
	} catch (error) {
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function RandomTextVerify({
	formVal,
}: FormInterface): React.JSX.Element {
	const { register, handleSubmit, reset, watch } = formVal;
	const {
		config,
		blockGroup,
		setIsConfigModalOpen,
		setConfigType,
		setSelectedBlockGroup,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
		setRandomTextContent,
	} = useStore();

	const handleClose = (): void => {
		setIsConfigModalOpen(false);
		setConfigType(null);
		setSelectedBlockGroup(null);
		setUsageResetPeriod(null);
		setUsageTimeValueNumber(null);
		setRandomTextContent("");
		reset();
	};

	const targetText = config.randomTextContent || "";
	const currentInput = watch("randomTextContent", "") || "";

	// Calculate match and error status
	let hasError = false;
	for (let i = 0; i < currentInput.length; i++) {
		if (i >= targetText.length || currentInput[i] !== targetText[i]) {
			hasError = true;
			break;
		}
	}

	const isCompleted = currentInput === targetText && targetText.length > 0;
	const progressPercent =
		targetText.length > 0
			? Math.min(100, (currentInput.length / targetText.length) * 100)
			: 0;

	return (
		<form
			noValidate
			onSubmit={handleSubmit((fv) => {
				randomTextUnlock(
					fv,
					config.randomTextContent,
					handleClose,
					blockGroup.selectedBlockGroup,
				);
			})}
		>
			<Stack spacing={2.5} pt={0.5}>
				{/* Header Status Card */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 1.5,
						borderRadius: 1.5,
						border: "1px solid",
						borderColor: isCompleted ? "success.main" : "divider",
						backgroundColor: "action.hover",
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1.25}>
						<SpellcheckOutlinedIcon
							fontSize="small"
							sx={{ color: isCompleted ? "success.main" : "primary.main" }}
						/>
						<Typography variant="body2" fontWeight={600}>
							Type challenge to unlock
						</Typography>
					</Stack>

					<Typography
						variant="caption"
						sx={{
							color: isCompleted ? "success.main" : "text.secondary",
							fontWeight: 600,
							fontSize: 11,
							px: 1,
							py: 0.25,
							borderRadius: 1,
							bgcolor: "background.paper",
							border: "1px solid",
							borderColor: "divider",
						}}
					>
						{currentInput.length} / {targetText.length} chars
					</Typography>
				</Box>

				{/* Interactive Monospace Challenge Tape */}
				<Box
					sx={{
						p: 2,
						border: "1px solid",
						borderColor: hasError
							? "error.main"
							: isCompleted
								? "success.main"
								: "divider",
						borderRadius: 1.5,
						backgroundColor: "background.default",
						fontFamily: 'Consolas, "Roboto Mono", monospace',
						fontSize: "1.1rem",
						letterSpacing: "0.14em",
						lineHeight: 1.8,
						wordBreak: "break-all",
						userSelect: "none",
						maxHeight: 120,
						overflowY: "auto",
					}}
				>
					{targetText.split("").map((char, index) => {
						let charColor = "text.disabled";
						let textDecoration = "none";
						let fontWeight = 500;
						let bgColor = "transparent";

						if (index < currentInput.length) {
							if (currentInput[index] === char) {
								charColor = "success.main";
								fontWeight = 700;
							} else {
								charColor = "error.main";
								bgColor = "error.light";
								fontWeight = 700;
							}
						} else if (index === currentInput.length) {
							// Current cursor position
							charColor = "text.primary";
							textDecoration = "underline";
							fontWeight = 700;
						}

						return (
							<span
								key={index}
								style={{
									color: `var(--mui-palette-${charColor.replace(".", "-")}, inherit)`,
									backgroundColor:
										bgColor === "transparent"
											? undefined
											: "rgba(239, 68, 68, 0.15)",
									textDecoration,
									fontWeight,
									paddingInline: "1px",
									borderRadius: "2px",
								}}
							>
								{char}
							</span>
						);
					})}
				</Box>

				{/* Thin Progress Indicator */}
				<LinearProgress
					variant="determinate"
					value={progressPercent}
					color={hasError ? "error" : isCompleted ? "success" : "primary"}
					sx={{ height: 3, borderRadius: 1 }}
				/>

				{/* Uncopyable Input Field */}
				<TextField
					size="small"
					fullWidth
					autoFocus
					placeholder="Type the exact characters above..."
					onPaste={(e) => {
						e.preventDefault();
						toast.error("Pasting is disabled for typing challenges");
					}}
					inputProps={{
						style: {
							fontFamily: 'Consolas, "Roboto Mono", monospace',
							letterSpacing: "0.08em",
						},
					}}
					{...register("randomTextContent")}
				/>

				{/* Unlock Button */}
				<Button
					type="submit"
					variant="contained"
					size="small"
					disabled={!isCompleted}
					startIcon={<LockOpenOutlinedIcon fontSize="small" />}
					sx={{ height: 38, fontWeight: 600, borderRadius: 1 }}
				>
					Verify & Unlock
				</Button>
			</Stack>
		</form>
	);
}
