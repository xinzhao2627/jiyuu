import { SxProps, Theme } from "@mui/material";

export const modalStyle = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: 400,
	bgcolor: "background.paper",
	boxShadow: 24,
	color: "black",
	outline: "none",
	pt: 2,
	px: 4,
	pb: 3,
};

export const modalTextFieldStyle: SxProps<Theme> = {
	"& input": {
		verticalAlign: "middle",
		borderRadius: "2px",
		minHeight: "36px",
		backgroundColor: "#ffffff",
		border: "1px solid rgba(36,28,21,0.3)",
		transition: "all 0.2s ease-in-out 0s",
		fontSize: "16px",
		lineHeight: "18px",
		fontWeight: "normal",
		outline: "none",
		"&:focus": {
			outline: "none",
			border: "1px solid #1976d2",
			boxShadow: "inset 0 0 0 1px #1976d2",
		},
	},
};
