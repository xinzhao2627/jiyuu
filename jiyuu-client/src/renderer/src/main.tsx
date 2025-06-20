// import "./assets/main.css";

import { StrictMode } from "react";
import { createRoot } from "react-dom/client";

import App from "./App";
import { createTheme, ThemeProvider } from "@mui/material";
const THEME = createTheme({
	typography: {
		fontFamily: "Inter, Arial, sans-serif",
	},
});
createRoot(document.getElementById("root")!).render(
	<ThemeProvider theme={THEME}>
		<StrictMode>
			<App />
		</StrictMode>
	</ThemeProvider>,
);
