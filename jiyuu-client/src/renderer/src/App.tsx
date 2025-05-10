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
		<Stack direction={"column"} width={"100vw"}>
			<Sidebar />

			{/* body */}
			<Blockings />
			{/* sidebar */}

			{/* for loop of all block groups */}

			{/* content */}
		</Stack>
	);
}

export default App;
