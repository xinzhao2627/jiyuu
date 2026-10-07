import { SxProps, Theme } from "@mui/material";

export const modalStyle: SxProps<Theme> = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "calc(100vw - 24px)", sm: 460 },
	maxHeight: "calc(100vh - 40px)",
	bgcolor: "background.paper",
	boxShadow: "none",
	color: "text.primary",
	outline: "none",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: 1.5,
	p: { xs: 2.5, sm: 3 },
	overflow: "auto",
};

export const modalTextFieldStyle: SxProps<Theme> = {
	display: "flex",
	flexDirection: "column",
	gap: 0.75,
	width: "100%",
	"& input, & .MuiSelect-select": {
		verticalAlign: "middle",
		borderRadius: "6px",
		minHeight: "36px",
		backgroundColor: "background.paper",
		border: "1px solid",
		borderColor: "divider",
		transition: "border-color 0.15s ease",
		fontSize: "0.875rem",
		paddingInline: "12px",
		color: "text.primary",
		outline: "none",
		"&:focus": {
			outline: "none",
			borderColor: "primary.main",
			backgroundColor: "background.paper",
		},
	},
};

export const scrollbarStyle: SxProps<Theme> = {
	"&::-webkit-scrollbar": {
		width: "6px",
		height: "6px",
	},
	"&::-webkit-scrollbar-track": {
		backgroundColor: "transparent",
	},
	"&::-webkit-scrollbar-thumb": {
		backgroundColor: (theme) =>
			theme.palette.mode === "dark"
				? "rgba(255, 255, 255, 0.16)"
				: "rgba(0, 0, 0, 0.16)",
		borderRadius: "3px",
	},
	"&::-webkit-scrollbar-thumb:hover": {
		backgroundColor: (theme) =>
			theme.palette.mode === "dark"
				? "rgba(255, 255, 255, 0.28)"
				: "rgba(0, 0, 0, 0.28)",
	},
};
