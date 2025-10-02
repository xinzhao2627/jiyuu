// import Versions from './components/Versions'

// import { Router } from "../../lib/electron-router-dom";
import Sidebar from "./components/Sidebar";
import "./input.css";
import Blockings from "./features/blockings/Blockings";
import { Route, HashRouter, Routes } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
import { Box, CssBaseline } from "@mui/material";
import Options from "./features/options/Options";
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

				<Box sx={{ flexShrink: 0, width: "100%", border: "1px solid #e5e5e5" }}>
					<Sidebar />
				</Box>

				<Toaster
					position="top-center"
					toastOptions={{
						className: "roboto-toast",
						duration: 1400,
						style: {
							fontWeight: "600",
							fontFamily: "roboto, Roboto",
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
					<Route path="/apps" element={<></>} />
					<Route path="/option" element={<Options />} />
				</Routes>
			</Layout>
		</HashRouter>
	);
}

export default App;
