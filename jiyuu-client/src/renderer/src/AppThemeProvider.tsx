import { StrictMode, useEffect, useMemo, useState } from "react";
import { alpha, createTheme, ThemeProvider } from "@mui/material";
import type { Theme } from "@mui/material";
import App from "./App";

type AppThemeMode = "light" | "dark";

const getInitialThemeMode = (): AppThemeMode => {
	const savedMode = localStorage.getItem("jiyuuThemeMode");
	return savedMode === "dark" ? "dark" : "light";
};

const createAppTheme = (mode: AppThemeMode): Theme =>
	createTheme({
		palette: {
			mode,
			...(mode === "dark"
				? {
						primary: {
							main: "#8a98ad",
							light: "#a7b2c1",
							dark: "#6f7d92",
							contrastText: "#111827",
						},
					}
				: {}),

			background: {
				default: mode === "light" ? "#edf1ec" : "#1e1e1e",
				paper: mode === "light" ? "#fbfaf6" : "#252526",
			},

			text: {
				primary: mode === "light" ? "#17211d" : "#d4d4d4",
				secondary: mode === "light" ? "#58645f" : "#9da5b4",
			},

			divider:
				mode === "light" ? alpha("#17211d", 0.12) : alpha("#ffffff", 0.08),
		},
		shape: {
			borderRadius: 6,
		},
		typography: {
			fontFamily: '"Aptos", "Segoe UI Variable Text", "Segoe UI", sans-serif',
			fontSize: 14,
			h1: {
				fontWeight: 700,
				fontFamily: '"Bahnschrift", "Aptos Display", "Segoe UI", sans-serif',
				letterSpacing: "0.01em",
			},
			h2: {
				fontWeight: 700,
				fontFamily: '"Bahnschrift", "Aptos Display", "Segoe UI", sans-serif',
				letterSpacing: "0.01em",
			},
			h3: {
				fontWeight: 700,
				fontFamily: '"Bahnschrift", "Aptos Display", "Segoe UI", sans-serif',
				letterSpacing: "0.01em",
			},
			h4: {
				fontWeight: 700,
				fontFamily: '"Bahnschrift", "Aptos Display", "Segoe UI", sans-serif',
				letterSpacing: "0.01em",
			},
			h5: {
				fontWeight: 600,
				fontFamily: '"Bahnschrift", "Aptos Display", "Segoe UI", sans-serif',
			},
			h6: {
				fontWeight: 600,
				fontFamily: '"Bahnschrift", "Aptos Display", "Segoe UI", sans-serif',
			},
			allVariants: {
				letterSpacing: 0,
			},
			button: {
				fontFamily: '"Bahnschrift", "Aptos", "Segoe UI", sans-serif',
				textTransform: "none",
				fontWeight: 600,
				letterSpacing: "0.02em",
			},
		},
		components: {
			MuiButtonBase: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiCssBaseline: {
				styleOverrides: {
					body: {
						background: mode === "light" ? "#edf1ec" : "#25211e",
					},
				},
			},
			MuiButton: {
				defaultProps: {
					disableElevation: true,
					disableRipple: true,
				},
				styleOverrides: {
					root: {
						borderRadius: 6,
						paddingInline: 16,
						boxShadow: "none",
						"&:hover": {
							boxShadow: "none",
						},
					},
					contained: {
						boxShadow: "none",
						"&:hover": {
							boxShadow: "none",
						},
					},
				},
			},
			MuiIconButton: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiCardActionArea: {
				defaultProps: {
					disableRipple: true,
				},
			},
			MuiCard: {
				styleOverrides: {
					root: {
						borderRadius: 6,
						border: "1px solid",
						borderColor:
							mode === "light" ? alpha("#17211d", 0.12) : alpha("#e9dfd1", 0.1),
						boxShadow: "none",
					},
				},
			},
			MuiDialog: {
				styleOverrides: {
					paper: {
						borderRadius: 6,
						border: "1px solid",
						borderColor:
							mode === "light" ? alpha("#17211d", 0.12) : alpha("#e9dfd1", 0.1),
						boxShadow: "none",
					},
				},
			},
			MuiChip: {
				styleOverrides: {
					root: {
						borderRadius: 6,
					},
				},
			},
			MuiTextField: {
				defaultProps: {
					variant: "outlined",
					size: "small",
				},
				styleOverrides: {
					root: {
						"& .MuiOutlinedInput-root, & .MuiFilledInput-root": {
							borderRadius: 6,
						},
					},
				},
			},
			MuiToggleButtonGroup: {
				styleOverrides: {
					root: {
						borderRadius: 6,
					},
				},
			},
		},
	});

export function AppThemeProvider(): React.JSX.Element {
	const [mode, setMode] = useState<AppThemeMode>(getInitialThemeMode);
	const theme = useMemo(() => createAppTheme(mode), [mode]);

	useEffect(() => {
		const handleThemeChange = (event: Event): void => {
			const nextMode = (event as CustomEvent<AppThemeMode>).detail;
			if (nextMode === "light" || nextMode === "dark") {
				localStorage.setItem("jiyuuThemeMode", nextMode);
				setMode(nextMode);
			}
		};

		window.addEventListener("jiyuu-theme-change", handleThemeChange);
		return () => {
			window.removeEventListener("jiyuu-theme-change", handleThemeChange);
		};
	}, []);

	return (
		<ThemeProvider theme={theme}>
			<StrictMode>
				<App />
			</StrictMode>
		</ThemeProvider>
	);
}
