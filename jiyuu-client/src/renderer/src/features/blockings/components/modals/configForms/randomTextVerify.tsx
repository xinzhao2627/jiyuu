import { useStore } from "@renderer/features/blockings/blockingsStore";
import { FieldValues } from "react-hook-form";
import toast from "react-hot-toast";
import { FormInterface, quickUnlock } from "./quickFunctions";
import { BlockGroup_Full } from "@renderer/jiyuuInterfaces";
import { Box, Typography, Button, Stack } from "@mui/material";
import { modalTextFieldStyle } from "@renderer/assets/shared/modalStyle";
const randomTextUnlock = (
	fv: FieldValues,
	randomTextContent: string,
	handleClose: () => void,
	selectedBlockGroup: BlockGroup_Full | null,
): void => {
	try {
		const rtcontent = fv.randomTextContent;
		// if one of the input or content is empty, throw an error
		if (!(rtcontent && randomTextContent))
			throw "Invalid input or invalid random generated characters";
		if (rtcontent === randomTextContent) {
			quickUnlock({ config_type: "randomText" }, selectedBlockGroup);
			handleClose();
		} else throw "Invalid text input";
	} catch (error) {
		console.log(error);
		toast.error(error instanceof Error ? error.message : String(error));
	}
};

export function RandomTextVerify({
	formVal,
}: FormInterface): React.JSX.Element {
	const { register, handleSubmit, reset } = formVal;
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
	return (
		<form
			noValidate
			style={{
				display: "flex",
				flexWrap: "wrap",
				width: "100%",
				marginTop: "16px",
			}}
			onSubmit={handleSubmit((fv) => {
				randomTextUnlock(
					fv,
					config.randomTextContent,
					handleClose,
					blockGroup.selectedBlockGroup,
				);
			})}
		>
			<Stack gap={2} width="100%">
				<Typography
					variant="body1"
					color="initial"
					sx={{
						userSelect: "none",
						pointerEvents: "none",
						width: "100%",
						whiteSpace: "normal",
						wordBreak: "break-all",
						letterSpacing: 0,
						fontWeight: 600,
						p: 1.5,
						border: "1px solid",
						borderColor: "divider",
						borderRadius: 1,
						backgroundColor: "background.default",
					}}
				>
					{config.randomTextContent}
				</Typography>
				<Typography variant="caption" color="text.secondary" width={"100%"}>
					Type the characters in the field below
				</Typography>
				<Box sx={{ ...modalTextFieldStyle }}>
					<input
						onPaste={(e) => {
							e.preventDefault();
						}}
						type="text"
						style={{ width: "100%", minHeight: "50px" }}
						id="randomTextCount"
						{...register("randomTextContent")}
					/>
				</Box>
				<Button type="submit" variant="contained" sx={{ fontWeight: "600" }}>
					Submit
				</Button>
			</Stack>
		</form>
	);
}
