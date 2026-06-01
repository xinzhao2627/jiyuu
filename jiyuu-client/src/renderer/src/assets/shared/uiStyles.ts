import { alpha, SxProps, Theme } from "@mui/material";

export const uiStyles: Record<string, SxProps<Theme>> = {
	pageShell: {
		height: "100%",
		width: "100%",
		overflow: "auto",
		px: { xs: 2, sm: 3 },
		py: { xs: 2, sm: 2.5 },
	},
	pageInner: {
		width: "100%",
		maxWidth: 1200,
		mx: "auto",
	},
	pageHeader: {
		mb: 3,
		gap: 1,
	},
	eyebrow: {
		color: "primary.main",
		fontWeight: 700,
		letterSpacing: 0,
		textTransform: "uppercase",
	},
	pageTitle: {
		fontWeight: 700,
		letterSpacing: 0,
	},
	pageSubtitle: {
		maxWidth: 760,
		color: "text.secondary",
	},
	sectionCard: {
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "0 12px 28px rgba(15, 23, 42, 0.06)",
	},
	sectionCardMuted: {
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.78),
		boxShadow: (theme) =>
			theme.palette.mode === "light"
				? "0 10px 24px rgba(15, 23, 42, 0.05)"
				: "0 16px 36px rgba(0, 0, 0, 0.24)",
		backdropFilter: "blur(10px)",
	},
	kpiCard: {
		height: "100%",
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
	},
	outlinedPanel: {
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
	},
	glassPanel: {
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.78),
		backdropFilter: "blur(12px)",
	},
	toolbarGroup: {
		p: 0.75,
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		boxShadow: "0 8px 20px rgba(15, 23, 42, 0.06)",
	},
	listItemCard: {
		borderRadius: 2,
		border: "1px solid",
		borderColor: "divider",
		backgroundColor: "background.paper",
		transition: "transform 0.2s ease, box-shadow 0.2s ease, border-color 0.2s ease",
		"&:hover": {
			transform: "translateY(-1px)",
			boxShadow: "0 14px 30px rgba(15, 23, 42, 0.08)",
			borderColor: "primary.light",
		},
	},
	emptyState: {
		minHeight: 220,
		borderRadius: 2,
		border: "1px dashed",
		borderColor: "divider",
		backgroundColor: (theme) => alpha(theme.palette.background.paper, 0.62),
		display: "flex",
		alignItems: "center",
		justifyContent: "center",
		textAlign: "center",
		px: 3,
	},
};

export const pageHeroStyle: SxProps<Theme> = {
	...uiStyles.sectionCardMuted,
	p: { xs: 2.5, sm: 3 },
};
