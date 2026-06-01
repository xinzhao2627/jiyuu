import { SxProps, Theme } from "@mui/material";

export const modalStyle: SxProps<Theme> = {
	position: "absolute",
	top: "50%",
	left: "50%",
	transform: "translate(-50%, -50%)",
	width: { xs: "calc(100vw - 24px)", sm: 440 },
	maxHeight: "calc(100vh - 32px)",
	bgcolor: "background.paper",
	boxShadow: "0 28px 80px rgba(15, 23, 42, 0.24)",
	color: "text.primary",
	outline: "none",
	border: "1px solid",
	borderColor: "divider",
	borderRadius: 2,
	pt: 3,
	px: { xs: 2.5, sm: 3.5 },
	pb: 3,
	overflow: "auto",
};

export const modalTextFieldStyle: SxProps<Theme> = {
	display: "flex",
	flexDirection: "column",
	gap: 0.75,
	width: "100%",
	"& input, & .MuiSelect-select": {
		verticalAlign: "middle",
		borderRadius: "8px",
		minHeight: "44px",
		backgroundColor: "background.paper",
		border: "1px solid",
		borderColor: "divider",
		transition:
			"border-color 0.2s ease, box-shadow 0.2s ease, background-color 0.2s ease",
		fontSize: "0.95rem",
		lineHeight: "1.5rem",
		fontWeight: 500,
		paddingInline: "12px",
		color: "text.primary",
		outline: "none",
		"&:focus": {
			outline: "none",
			borderColor: "primary.main",
			boxShadow: "0 0 0 4px rgba(37, 99, 235, 0.14)",
			backgroundColor: "background.paper",
		},
	},
};

export const scrollbarStyle: SxProps<Theme> = {
	"&::-webkit-scrollbar": {
		width: "8px",
	},
	"&::-webkit-scrollbar-track": {
		backgroundColor: "transparent",
	},
	"&::-webkit-scrollbar-thumb": {
		backgroundColor: "rgba(100, 116, 139, 0.3)",
		borderRadius: "999px",
	},
	"&::-webkit-scrollbar-thumb:hover": {
		backgroundColor: "rgba(37, 99, 235, 0.45)",
	},
};
