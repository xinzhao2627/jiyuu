import BottomNav from "./components/BottomNav";
import "./input.css";
import Blockings from "./features/blockings/Blockings";
import { Route, HashRouter, Routes } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
import { Box, CssBaseline } from "@mui/material";
import Options from "./features/options/Options";
import Whitelist from "./features/whitelist/Whitelist";
function Layout({
	children,
}: {
	children: React.ReactNode;
}): React.JSX.Element {
	return (
		<>
			<CssBaseline />
			<Box
				sx={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					width: "100vw",
					backgroundColor: "#F8F8FF",
				}}
			>
				<Box sx={{ flex: 1, overflow: "auto" }}>{children}</Box>

				{/* BOTTOM NAVIGATION BAR */}
				<Box sx={{ flexShrink: 0, width: "100%", border: "1px solid #e5e5e5" }}>
					<BottomNav />
				</Box>

				{/* TOAST MESSAGE STYLE */}
				<Toaster
					position="top-center"
					toastOptions={{
						className: "roboto-toast",
						duration: 1400,
						style: {
							fontWeight: "600",
							fontFamily: "roboto, Roboto",
						},
						success: {
							style: {
								background: "#D1FAE5", // light green
								color: "#065F46", // dark green
								border: "1px solid #10B981", // green border
							},
							iconTheme: {
								primary: "#10B981", // icon color
								secondary: "#D1FAE5",
							},
						},
						error: {
							style: {
								background: "#FEE2E2", // light red
								color: "#991B1B", // dark red
								border: "1px solid #EF4444",
							},
							iconTheme: {
								primary: "#EF4444",
								secondary: "#FEE2E2",
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
