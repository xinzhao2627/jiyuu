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
import { Button, Stack, Typography } from "@mui/material";
import { isBefore } from "date-fns";
import dayjs from "dayjs";

const restrictTimerSubmit = (
	fv: FieldValues,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const d = new Date(fv.restrictTimer);
		const currentDate = new Date();
		if (!fv.restrictTimer || isNaN(d.getTime())) throw "Invalid date";
		if (isBefore(d, currentDate)) throw "Past dates are not allowed";
		quickSendForms(
			{
				end_date: d,
				config_type: "restrictTimer",
			},
			selectedBlockGroup,
		);
		handleClose();
	} catch (error) {
		console.log(error);
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function RestrictTimerForm({
	formVal,
}: FormInterface): React.JSX.Element {
	const { handleSubmit, control, reset } = formVal;
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
	return (
		<LocalizationProvider dateAdapter={AdapterDayjs}>
			<form
				noValidate
				onSubmit={handleSubmit((fv) => {
					restrictTimerSubmit(fv, handleClose, blockGroup.selectedBlockGroup);
				})}
				style={{
					display: "flex",
					flexWrap: "wrap",
				}}
			>
				<Stack gap={3} width={"100%"}>
					<Controller
						name="restrictTimer"
						defaultValue={null}
						control={control}
						render={({ field }) => (
							<MobileDateTimePicker
								{...field}
								onChange={(nv) => field.onChange(nv)}
								views={["year", "month", "day", "hours", "minutes"]}
								minDateTime={dayjs()}
								slotProps={{
									textField: {
										fullWidth: true,
										variant: "filled",
										size: "small",
										helperText: "Block group will be locked until this time",
									},
								}}
							/>
						)}
					/>

					<Typography variant="body1" color="initial">
						Select the end period for the restriction
					</Typography>
					<Button type="submit" variant="contained" sx={{ fontWeight: "600" }}>
						Submit
					</Button>
				</Stack>
			</form>
		</LocalizationProvider>
	);
}
