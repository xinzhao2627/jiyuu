// import ShieldIcon from "@mui/icons-material/Shield";
import {
	BottomNavigation,
	BottomNavigationAction,
	SxProps,
	Theme,
} from "@mui/material";
import TuneIcon from "@mui/icons-material/Tune";
import DashboardOutlinedIcon from "@mui/icons-material/DashboardOutlined";
import AppsIcon from "@mui/icons-material/Apps";
// import VpnLockIcon from "@mui/icons-material/VpnLock";
import { useLocation, useNavigate } from "react-router-dom";
import ShieldOutlinedIcon from "@mui/icons-material/ShieldOutlined";
const actionStyle: SxProps<Theme> = { fontWeight: 500, letterSpacing: 1 };
const iconActionStyle: SxProps<Theme> = { mb: "2px" };
export default function Sidebar(): React.JSX.Element {
	const location = useLocation();
	const navigate = useNavigate();

	const routes = ["/", "/dashboard", "/whitelist", "/option"];
	const currentTab = routes.indexOf(location.pathname);
	const handleChange = (
		_event: React.SyntheticEvent,
		newValue: number,
	): void => {
		navigate(routes[newValue]);
	};
	return (
		<BottomNavigation
			value={currentTab}
			onChange={handleChange}
			showLabels
			sx={{
				backgroundColor: "transparent",
				width: "100%",
				display: "flex",
				"& .MuiBottomNavigationAction-root": {
					flex: 1,
					minWidth: 0,
					maxWidth: "none",
				},
				padding: 1,
				// backdropFilter: "blur(2px)",
			}}
		>
			<BottomNavigationAction
				label="BLOCKINGS"
				icon={<ShieldOutlinedIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>

			<BottomNavigationAction
				label="DASHBOARD"
				icon={<DashboardOutlinedIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="WHITELIST"
				icon={<AppsIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
			<BottomNavigationAction
				label="OPTION"
				icon={<TuneIcon sx={iconActionStyle} />}
				sx={actionStyle}
			/>
		</BottomNavigation>
	);
}
