/* eslint-disable @typescript-eslint/no-unused-vars */
import * as React from "react";
import { useState, useEffect } from "react";
import Drawer from "@mui/material/Drawer";
import Box from "@mui/material/Box";
import Tabs from "@mui/material/Tabs";
import Tab from "@mui/material/Tab";
import {
	BottomNavigation,
	BottomNavigationAction,
	ListItem,
	ListItemButton,
	ListItemIcon,
	ListItemText,
} from "@mui/material";
import AddLocationIcon from "@mui/icons-material/AddLocation";
import TuneIcon from "@mui/icons-material/Tune";
import AbcIcon from "@mui/icons-material/Abc";
import DashboardIcon from "@mui/icons-material/Dashboard";
import VpnLockIcon from "@mui/icons-material/VpnLock";
import { Link, useLocation, useNavigate } from "react-router-dom";
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
	const location = useLocation();
	const navigate = useNavigate();

	const routes = ["/", "/dashboard", "/wordbank", "/options"];
	const currentTab = routes.indexOf(location.pathname);
	const handleChange = (
		event: React.SyntheticEvent,
		newValue: number,
	): void => {
		navigate(routes[newValue]);
	};
	return (
		<BottomNavigation
			value={currentTab}
			onChange={handleChange}
			showLabels
			sx={{ backgroundColor: "transparent" }}
		>
			<BottomNavigationAction label="Blockings" icon={<VpnLockIcon />} />

			<BottomNavigationAction label="Dashboard" icon={<DashboardIcon />} />

			<BottomNavigationAction label="Word Bank" icon={<AbcIcon />} />
			<BottomNavigationAction label="Options" icon={<TuneIcon />} />
		</BottomNavigation>
	);
}
