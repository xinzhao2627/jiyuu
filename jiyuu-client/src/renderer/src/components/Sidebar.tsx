/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import AddLocationIcon from "@mui/icons-material/AddLocation";
const ConfigItem: React.FC<{ text: string; callback: (c) => void }> = ({
	text,
	callback,
}) => {
	return (
		<ListItem sx={{ padding: "4px", margin: 0 }}>
			<ListItemButton>
				<ListItemIcon sx={{ minWidth: "30px" }}>
					<AddLocationIcon />
				</ListItemIcon>
				<ListItemText primary={text} />
			</ListItemButton>
		</ListItem>
	);
};

export default function Sidebar(): React.JSX.Element {
	const [value, setValue] = React.useState(2);

	const handleChange = (
		event: React.SyntheticEvent,
		newValue: number,
	): void => {
		setValue(newValue);
	};
	return (
		<Tabs
			value={value}
			onChange={handleChange}
			variant="fullWidth"
			sx={{ backgroundColor: "white" }}
		>
			<Tab label="Dashboard" />
			<Tab label="Blockings" />
			<Tab label="Option" />
		</Tabs>
	);
}
