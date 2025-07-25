// import "./assets/main.css";
// import * as React from "react";
import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material";
import "@fontsource/roboto/300.css";
import "@fontsource/roboto/400.css";
import "@fontsource/roboto/500.css";
import "@fontsource/roboto/700.css";
const THEME = createTheme({
	typography: {
		fontFamily: "roboto, Arial, sans-serif",
		allVariants: {
			letterSpacing: "0.8px",
		},
		button: {
			letterSpacing: "0.8px",
			textTransform: "none",
		},
	},
});
createRoot(document.getElementById("root")!).render(
	<ThemeProvider theme={THEME}>
		<StrictMode>
			<App />
		</StrictMode>
	</ThemeProvider>,
);
