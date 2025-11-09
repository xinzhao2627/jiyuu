import * as React from "react";
import { styled, alpha } from "@mui/material/styles";
import Button from "@mui/material/Button";
import Menu, { MenuProps } from "@mui/material/Menu";
import MenuItem from "@mui/material/MenuItem";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import AccessTimeIcon from "@mui/icons-material/AccessTime";
import ListSubheader from "@mui/material/ListSubheader";

import {
	BlockGroup_Full,
	FIVE_MINUTES,
	ONE_DAY,
	ONE_HOUR,
	ONE_MINUTE,
	SIX_HOURS,
	TEN_MINUTES,
	THIRTY_MINUTES,
} from "@renderer/jiyuuInterfaces";
import { ipcRendererSend } from "../blockingAPI";
const StyledListHeader = styled(ListSubheader)({
	backgroundImage: "var(--Paper-overlay)",
});
const StyledMenu = styled((props: MenuProps) => (
	<Menu
		elevation={0}
		anchorOrigin={{
			vertical: "bottom",
			horizontal: "right",
		}}
		transformOrigin={{
			vertical: "top",
			horizontal: "right",
		}}
		{...props}
	/>
))(({ theme }) => ({
	"& .MuiPaper-root": {
		borderRadius: 6,
		marginTop: theme.spacing(1),
		minWidth: 180,
		color: "rgb(55, 65, 81)",
		boxShadow:
			"rgb(255, 255, 255) 0px 0px 0px 0px, rgba(0, 0, 0, 0.05) 0px 0px 0px 1px, rgba(0, 0, 0, 0.1) 0px 10px 15px -3px, rgba(0, 0, 0, 0.05) 0px 4px 6px -2px",
		"& .MuiMenu-list": {
			padding: "4px 0",
		},
		"& .MuiMenuItem-root": {
			"& .MuiSvgIcon-root": {
				fontSize: 18,
				color: theme.palette.text.secondary,
				marginRight: theme.spacing(1.5),
				...theme.applyStyles("dark", {
					color: "inherit",
				}),
			},
			"&:active": {
				backgroundColor: alpha(
					theme.palette.primary.main,
					theme.palette.action.selectedOpacity,
				),
			},
		},
		...theme.applyStyles("dark", {
			color: theme.palette.grey[300],
		}),
	},
}));

interface UsageAndPauseMenuInterface {
	blockGroup: BlockGroup_Full;
}
export default function UsageAndPauseMenu({
	blockGroup,
}: UsageAndPauseMenuInterface): React.JSX.Element {
	const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
	const label = blockGroup.usage_label;
	const restriction_type = blockGroup.restriction_type;
	const open = Boolean(anchorEl);
	const handleClick = (event: React.MouseEvent<HTMLElement>): void => {
		setAnchorEl(event.currentTarget);
	};
	const handleClose = (): void => {
		setAnchorEl(null);
	};

	// the pause length is in seconds format, not date num
	const pauseInitiate = (pauseLength: number): void => {
		if (pauseLength > 0) {
			ipcRendererSend("blockgroupconfig/usageLimit/pause/set", {
				id: blockGroup.id,
				pauseLength: pauseLength,
			});
		}
		handleClose();
	};

	return (
		<div style={{ minWidth: "33%" }}>
			<Button
				aria-haspopup="true"
				aria-expanded={open ? "true" : undefined}
				variant="contained"
				disableElevation
				onClick={handleClick}
				endIcon={<KeyboardArrowDownIcon />}
			>
				{label}
			</Button>
			{!restriction_type && (
				<StyledMenu anchorEl={anchorEl} open={open} onClose={handleClose}>
					<StyledListHeader>Pause the usage limit: </StyledListHeader>
					<MenuItem onClick={() => pauseInitiate(ONE_MINUTE)} disableRipple>
						<AccessTimeIcon />1 min
					</MenuItem>
					<MenuItem onClick={() => pauseInitiate(FIVE_MINUTES)} disableRipple>
						<AccessTimeIcon />5 mins
					</MenuItem>
					<MenuItem onClick={() => pauseInitiate(TEN_MINUTES)} disableRipple>
						<AccessTimeIcon />
						10 mins
					</MenuItem>
					<MenuItem onClick={() => pauseInitiate(THIRTY_MINUTES)} disableRipple>
						<AccessTimeIcon />
						30 mins
					</MenuItem>
					<MenuItem onClick={() => pauseInitiate(ONE_HOUR)} disableRipple>
						<AccessTimeIcon />1 hour
					</MenuItem>
					<MenuItem onClick={() => pauseInitiate(SIX_HOURS)} disableRipple>
						<AccessTimeIcon />6 hours
					</MenuItem>
					<MenuItem onClick={() => pauseInitiate(ONE_DAY)} disableRipple>
						<AccessTimeIcon />1 day
					</MenuItem>
				</StyledMenu>
			)}
		</div>
	);
}
