import { alpha, SxProps, Theme } from "@mui/material";

export const uiStyles: Record<string, SxProps<Theme>> = {
	pageShell: {
		width: "100%",
		px: { xs: 2, sm: 3 },
		py: { xs: 2, sm: 2.5 },
	},
	pageInner: {
		width: "100%",
		maxWidth: 1100,
		mx: "auto",
	},
	pageHeader: {
		mb: 2.5,
		gap: 0.5,
	},
	eyebrow: {
		color: "primary.main",
		fontWeight: 700,
		letterSpacing: "0.08em",
		textTransform: "uppercase",
		fontSize: "0.72rem",
	},
	pageTitle: {
		fontWeight: 700,
		letterSpacing: "-0.01em",
	},
	pageSubtitle: {
		maxWidth: 680,
		color: "text.secondary",
		fontSize: "0.875rem",
		lineHeight: 1.5,
	},
	sectionCard: {
		borderRadius: 1.5,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "none",
	},
	sectionCardMuted: {
		borderRadius: 1.5,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "none",
	},
	kpiCard: {
		height: "100%",
		borderRadius: 1.5,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "none",
	},
	outlinedPanel: {
		borderRadius: 1.5,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
	},
	toolbarGroup: {
		p: 1,
		borderRadius: 1.5,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "none",
	},
	listItemCard: {
		borderRadius: 1.5,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "none",
		transition: "border-color 0.15s ease, background-color 0.15s ease",
		"&:hover": {
			borderColor: "primary.main",
		},
	},
	emptyState: {
		minHeight: 140,
		borderRadius: 1.5,
		border: "1px dashed",
		borderColor: "divider",
		backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.4),
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		px: 3,
		py: 2,
	},
};

export const pageHeroStyle: SxProps<Theme> = {
	...uiStyles.sectionCard,
	p: { xs: 2, sm: 2.5 },
};
