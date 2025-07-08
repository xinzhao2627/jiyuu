/* eslint-disable @typescript-eslint/no-unused-vars */
// import Versions from './components/Versions'

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./input.css";
import { Stack, Typography } from "@mui/material";
import Blockings from "./features/blockings/Blockings";
import { BrowserRouter, Route, Routes } from "react-router-dom";
import Dashboard from "./features/dashboard/Dashboard";
import { Toaster } from "react-hot-toast";

function App(): React.JSX.Element {
	useEffect(() => {}, []);
	return (
		<BrowserRouter>
			<div
				style={{
					display: "flex",
					flexDirection: "column",
					height: "100vh",
					width: "100vw",
					backgroundColor: "#F8F8FF",
				}}
			>
				<div style={{ flex: 1, overflow: "auto" }}>
					<Routes>
						<Route path="/" element={<Blockings />} />
						<Route path="/dashboard" element={<Dashboard />} />
					</Routes>
				</div>

				<div
					style={{
						flexShrink: 0,
						width: "100%",
					}}
				>
					<Sidebar />
				</div>
				<Toaster
					position="top-center"
					toastOptions={{
						className: "roboto-toast",
						duration: 1200,
						style: {
							fontWeight: "600",
						},
					}}
				/>
			</div>
		</BrowserRouter>
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
