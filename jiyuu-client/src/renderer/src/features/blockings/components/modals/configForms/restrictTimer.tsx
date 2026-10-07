import * as React from "react";
import { BlockGroup_Full } from "@renderer/jiyuuInterfaces";
import { Controller, FieldValues } from "react-hook-form";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import {
	LocalizationProvider,
	MobileDateTimePicker,
} from "@mui/x-date-pickers";
import { FormInterface, quickSendForms } from "./quickFunctions";
import toast from "react-hot-toast";
import { useStore } from "@renderer/features/blockings/blockingsStore";
import { Button, Stack, Typography, Box } from "@mui/material";
import LockClockOutlinedIcon from "@mui/icons-material/LockClockOutlined";
import LockOutlinedIcon from "@mui/icons-material/LockOutlined";
import { isBefore } from "date-fns";
import dayjs, { Dayjs } from "dayjs";

const SHORTCUTS = [
	{ label: "+30m", getTarget: () => dayjs().add(30, "minute") },
	{ label: "+1h", getTarget: () => dayjs().add(1, "hour") },
	{ label: "+2h", getTarget: () => dayjs().add(2, "hour") },
	{ label: "+4h", getTarget: () => dayjs().add(4, "hour") },
	{ label: "Midnight", getTarget: () => dayjs().endOf("day") },
	{
		label: "Tomorrow 9 AM",
		getTarget: () => dayjs().add(1, "day").hour(9).minute(0).second(0),
	},
];

const restrictTimerSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const raw = fv.restrictTimer;
		const d = raw ? (dayjs.isDayjs(raw) ? raw.toDate() : new Date(raw)) : null;
		const currentDate = new Date();
		if (!d || isNaN(d.getTime())) throw new Error("Invalid date selected");
		if (isBefore(d, currentDate)) throw new Error("Past dates are not allowed");
		quickSendForms(
			{
				end_date: d,
				config_type: "restrictTimer",
			},
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		console.error(error);
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function RestrictTimerForm({
	formVal,
}: FormInterface): React.JSX.Element {
	const { handleSubmit, control, reset, setValue, watch } = formVal;
	const {
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

	const selectedTime = watch("restrictTimer", null);

	// Format readout
	const formatDuration = (): string => {
		if (!selectedTime) return "Select target duration";
		const target = dayjs.isDayjs(selectedTime)
			? selectedTime
			: dayjs(selectedTime);
		if (!target.isValid()) return "Invalid time";

		const now = dayjs();
		const diffMinutes = target.diff(now, "minute");
		if (diffMinutes <= 0) return "Time has already passed";

		const hours = Math.floor(diffMinutes / 60);
		const mins = diffMinutes % 60;

		const timeStr = target.format("MMM D, h:mm A");
		const diffStr =
			hours > 0 ? `${hours}h ${mins > 0 ? `${mins}m` : ""}`.trim() : `${mins}m`;

		return `Locked until ${timeStr} (${diffStr})`;
	};

	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<form
				noValidate
				onSubmit={handleSubmit((fv) => {
					restrictTimerSubmit(fv, handleClose, blockGroup.selectedBlockGroup);
				})}
			>
				<Stack spacing={2.5} pt={0.5}>
					{/* Status Header */}
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
							<LockClockOutlinedIcon
								fontSize="small"
								sx={{ color: "primary.main" }}
							/>
							<Typography variant="body2" fontWeight={600}>
								{formatDuration()}
							</Typography>
						</Stack>

						<Typography
							variant="caption"
							sx={{
								color: "warning.main",
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
							Irreversible
						</Typography>
					</Box>

					{/* Quick Duration Shortcuts */}
					<Stack direction="row" spacing={0.75} flexWrap="wrap" useFlexGap>
						{SHORTCUTS.map((s) => (
							<Button
								key={s.label}
								size="small"
								variant="outlined"
								onClick={() => setValue("restrictTimer", s.getTarget())}
								sx={{
									height: 30,
									fontSize: 12,
									fontWeight: 500,
									borderRadius: 1,
									px: 1.25,
								}}
							>
								{s.label}
							</Button>
						))}
					</Stack>

					{/* DateTime Picker Field */}
					<Controller
						name="restrictTimer"
						defaultValue={null}
						control={control}
						render={({ field }) => (
							<MobileDateTimePicker
								{...field}
								value={field.value ? dayjs(field.value) : null}
								onChange={(nv: Dayjs | null) => field.onChange(nv)}
								views={["year", "month", "day", "hours", "minutes"]}
								minDateTime={dayjs()}
								slotProps={{
									textField: {
										fullWidth: true,
										size: "small",
										placeholder: "Pick target date and time",
										sx: {
											"& .MuiOutlinedInput-root": {
												borderRadius: 1,
											},
										},
									},
								}}
							/>
						)}
					/>

					{/* Submit Action */}
					<Button
						type="submit"
						variant="contained"
						size="small"
						disabled={!selectedTime}
						startIcon={<LockOutlinedIcon fontSize="small" />}
						sx={{ height: 38, fontWeight: 600, borderRadius: 1 }}
					>
						Engage Timer Lock
					</Button>
				</Stack>
			</form>
		</LocalizationProvider>
	);
}
