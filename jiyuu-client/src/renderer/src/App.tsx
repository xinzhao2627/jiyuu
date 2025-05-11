/* eslint-disable @typescript-eslint/no-unused-vars */
// import Versions from './components/Versions'

import { useEffect, useState } from "react";
import Sidebar from "./components/Sidebar";
import "./input.css";
import { Stack, Typography } from "@mui/material";
import Blockings from "./features/blockings/Blockings";

function App(): React.JSX.Element {
	useEffect(() => {}, []);
	return (
		<div style={{ display: "block", height: "100vh", width: "100vw" }}>
			<Sidebar />
			<div style={{ flex: 1, overflow: "auto" }}>
				<Blockings />
			</div>
		</div>
	);
}

export default App;
