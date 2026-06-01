import BottomNav from "./components/BottomNav";
import "./input.css";
import Blockings from "./features/blockings/Blockings";
import { Route, HashRouter, Routes } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
import { Box, CssBaseline } from "@mui/material";
import { useTheme } from "@mui/material/styles";
import Options from "./features/options/Options";
import Whitelist from "./features/whitelist/Whitelist";
import {
	BotbarTutorial,
	ExtensionInstallNotice,
} from "./components/botbarTutorial";

function Layout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	const theme = useTheme();
	const isDark = theme.palette.mode === "dark";

	return (
		<>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					width: "100vw",
					backgroundColor: "background.default",
					position: "relative",
					overflow: "hidden",
				}}
			>
				<Box sx={{ flex: 1, overflow: "auto", pb: 1, position: "relative" }}>
					{children}
				</Box>

				<Box
					sx={{
						position: "relative",
						flexShrink: 0,
						width: "100%",
						borderTop: "1px solid",
						borderColor: "divider",
						backdropFilter: "blur(18px)",
					}}
				>
					<BotbarTutorial />
					<BottomNav />
				</Box>
				<ExtensionInstallNotice />

				<Toaster
					position="top-center"
					toastOptions={{
						className: "roboto-toast",
						duration: 1800,
						style: {
							fontWeight: "500",
							fontFamily: "Inter, Roboto, sans-serif",
							borderRadius: "0px",
							background: theme.palette.background.paper,
							color: theme.palette.text.primary,
							border: `1px solid ${theme.palette.divider}`,
							boxShadow: isDark
								? "0 18px 38px rgba(0, 0, 0, 0.36)"
								: "0 18px 38px rgba(15, 23, 42, 0.12)",
						},
						success: {
							style: {
								background: theme.palette.success.main,
								color: theme.palette.success.contrastText,
								border: `1px solid ${theme.palette.success.main}`,
							},
							iconTheme: {
								primary: theme.palette.success.main,
								secondary: theme.palette.background.paper,
							},
						},
						error: {
							style: {
								background: theme.palette.error.main,
								color: theme.palette.error.contrastText,
								border: `1px solid ${theme.palette.error.main}`,
							},
							iconTheme: {
								primary: theme.palette.error.main,
								secondary: theme.palette.background.paper,
							},
						},
					}}
				/>
			</Box>
		</>
	);
}

function App(): React.JSX.Element {
	return (
		<HashRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<Blockings />} />
					<Route path="/dashboard" element={<Dashboard />} />
					<Route path="/whitelist" element={<Whitelist />} />
					<Route path="/option" element={<Options />} />
				</Routes>
			</Layout>
		</HashRouter>
	);
}

export default App;
