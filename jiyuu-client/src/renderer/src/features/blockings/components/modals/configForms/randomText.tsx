import * as React from "react";
import { FieldValues } from "react-hook-form";
import { FormInterface, quickSendForms } from "./quickFunctions";
import { useStore } from "@renderer/features/blockings/blockingsStore";
import {
	Button,
	IconButton,
	Stack,
	TextField,
	Typography,
	Box,
} from "@mui/material";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove";
import SpellcheckOutlinedIcon from "@mui/icons-material/SpellcheckOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { BlockGroup_Full } from "@renderer/jiyuuInterfaces";
import toast from "react-hot-toast";

const TIERS = [
	{ label: "Light", count: 15 },
	{ label: "Standard", count: 30 },
	{ label: "Strict", count: 50 },
	{ label: "Extreme", count: 80 },
];

const generateSampleString = (length: number): string => {
	const characters = "abcdefghijklmnopqrstuvwxyz0123456789";
	let res = "";
	for (let i = 0; i < Math.min(length, 120); i++) {
		res += characters.charAt((i * 7 + 3) % characters.length);
	}
	return res;
};

const randomTextSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const randomTextCount = Number(fv.randomTextCount);
		if (
			!randomTextCount ||
			Number.isNaN(randomTextCount) ||
			randomTextCount <= 0
		) {
			toast.error("Please enter a valid character count");
			return;
		}
		if (randomTextCount > 999) {
			toast.error("Character count must be 999 or fewer");
			return;
		}
		quickSendForms(
			{
				randomTextCount: randomTextCount,
				config_type: "randomText",
			},
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function RandomTextInput({ formVal }: FormInterface): React.JSX.Element {
	const { register, handleSubmit, reset, setValue, watch } = formVal;
	const {
		blockGroup,
		setConfigType,
		setSelectedBlockGroup,
		setUsageResetPeriod,
		setUsageTimeValueNumber,
		setRandomTextContent,
		setIsConfigModalOpen,
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

	const currentCount = Number(watch("randomTextCount", 30)) || 30;
	const sampleText = React.useMemo(
		() => generateSampleString(currentCount),
		[currentCount],
	);

	const handleStep = (delta: number): void => {
		const next = Math.max(5, Math.min(999, currentCount + delta));
		setValue("randomTextCount", next);
	};

	return (
		<form
			noValidate
			onSubmit={handleSubmit((fv) => {
				randomTextSubmit(fv, handleClose, blockGroup.selectedBlockGroup);
			})}
		>
			<Stack spacing={2.5} pt={0.5}>
				{/* Status Readout Banner */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						justifyContent: "space-between",
						p: 1.5,
						borderRadius: 1.5,
						border: "1px solid",
						borderColor: "divider",
						backgroundColor: "action.hover",
					}}
				>
					<Stack direction="row" alignItems="center" spacing={1.25}>
						<SpellcheckOutlinedIcon
							fontSize="small"
							sx={{ color: "primary.main" }}
						/>
						<Typography variant="body2" fontWeight={600}>
							{currentCount} characters challenge
						</Typography>
					</Stack>

					<Typography
						variant="caption"
						sx={{
							color: "text.secondary",
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
						Typing Barrier
					</Typography>
				</Box>

				{/* Difficulty Presets */}
				<Stack direction="row" spacing={1}>
					{TIERS.map((tier) => {
						const isSelected = currentCount === tier.count;
						return (
							<Button
								key={tier.label}
								size="small"
								variant={isSelected ? "contained" : "outlined"}
								onClick={() => setValue("randomTextCount", tier.count)}
								sx={{
									flex: 1,
									height: 32,
									fontSize: 12,
									fontWeight: isSelected ? 700 : 500,
									borderRadius: 1,
								}}
							>
								{tier.label} ({tier.count})
							</Button>
						);
					})}
				</Stack>

				{/* Stepper Count Controller */}
				<Box
					sx={{
						display: "flex",
						alignItems: "center",
						border: "1px solid",
						borderColor: "divider",
						borderRadius: 1,
						bgcolor: "background.paper",
						px: 0.5,
					}}
				>
					<IconButton
						size="small"
						onClick={() => handleStep(-5)}
						disabled={currentCount <= 5}
						sx={{ color: "text.secondary" }}
					>
						<RemoveIcon fontSize="small" />
					</IconButton>

					<TextField
						size="small"
						type="number"
						variant="standard"
						fullWidth
						inputProps={{
							min: 1,
							max: 999,
							style: {
								textAlign: "center",
								fontWeight: 600,
								fontSize: "0.95rem",
							},
						}}
						InputProps={{ disableUnderline: true }}
						{...register("randomTextCount")}
						defaultValue={30}
					/>

					<IconButton
						size="small"
						onClick={() => handleStep(5)}
						disabled={currentCount >= 999}
						sx={{ color: "text.secondary" }}
					>
						<AddIcon fontSize="small" />
					</IconButton>
				</Box>

				{/* Live Tape Preview */}
				<Box
					sx={{
						p: 1.5,
						borderRadius: 1,
						border: "1px dashed",
						borderColor: "divider",
						backgroundColor: "background.default",
					}}
				>
					<Typography
						variant="caption"
						color="text.secondary"
						sx={{ display: "block", mb: 0.5, fontSize: 11, fontWeight: 500 }}
					>
						Sample Challenge Preview
					</Typography>
					<Typography
						variant="body2"
						sx={{
							fontFamily: 'Consolas, "Roboto Mono", monospace',
							fontSize: "0.85rem",
							fontWeight: 600,
							letterSpacing: "0.08em",
							wordBreak: "break-all",
							color: "text.secondary",
							maxHeight: 60,
							overflowY: "auto",
							userSelect: "none",
						}}
					>
						{sampleText}
					</Typography>
				</Box>

				{/* Submit Button */}
				<Button
					type="submit"
					variant="contained"
					size="small"
					startIcon={<LockOutlinedIcon fontSize="small" />}
					sx={{ height: 38, fontWeight: 600, borderRadius: 1 }}
				>
					Lock with Typing Challenge
				</Button>
			</Stack>
		</form>
	);
}
