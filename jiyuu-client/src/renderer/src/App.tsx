// import Versions from './components/Versions'

import React, { useEffect } from "react";
// import { Router } from "../../lib/electron-router-dom";
import Sidebar from "./components/Sidebar";
import "./input.css";
import Blockings from "./features/blockings/Blockings";
import { Route, HashRouter, Routes } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import { Toaster } from "react-hot-toast";
import { Box, CssBaseline } from "@mui/material";
// import { CssBaseline } from "@mui/material";
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
				<Box sx={{ flex: 1, overflow: "auto" }}>
					{children} {/* ✅ This is where the route content goes */}
				</Box>

				<Box sx={{ flexShrink: 0, width: "100%" }}>
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
// function App(): React.JSX.Element {
// 	useEffect(() => {}, []);
// 	return (
// 		<>
// 			<Router
// 				main={
// 					<>
// 						{/* <CssBaseline /> */}

// 						<Route
// 							path="/"
// 							element={
// 								<Layout>
// 									<Blockings />
// 								</Layout>
// 							}
// 						/>
// 						<Route
// 							path="/dashboard"
// 							element={
// 								<Layout>
// 									<Dashboard />
// 								</Layout>
// 							}
// 						/>
// 					</>
// 				}
// 			/>
// 		</>
// 	);
// }
function App(): React.JSX.Element {
	useEffect(() => {}, []);
	return (
		<HashRouter>
			<Layout>
				<Routes>
					<Route path="/" element={<Blockings />} />
					<Route path="/dashboard" element={<Dashboard />} />
				</Routes>
			</Layout>
		</HashRouter>
	);
}

// interface gg  {
//   backgroundcolor: #333;
//   overflow: hidden;
//   position: fixed;
//   bottom: 0;
//   width: 100%;
// }

export default App;
