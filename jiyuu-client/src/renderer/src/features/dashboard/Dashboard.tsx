import * as React from "react";

import {
	Box,
	Grid,
	IconButton,
	Stack,
	SxProps,
	Theme,
	ToggleButton,
	ToggleButtonGroup,
	Typography,
} from "@mui/material";
import TopKpi from "./components/TopKpi";

import { useStore } from "../blockings/blockingsStore";
import MoreHorizIcon from "@mui/icons-material/MoreHoriz";

function miniCardTime(count: number): React.JSX.Element {
	return (
		<Box
			sx={{
				display: "flex",
			}}
		>
			<Typography variant="h3" color="initial">
				{count}
			</Typography>
		</Box>
	);
}

export default function Dashboard(): React.JSX.Element {
	const [, set] = React.useState<Array<{}>>();
	React.useEffect(() => {
		const listeners = [
			{
				channel: "usagelog/get/response",
				handler: (_, data) => {
					if (data.error) {
						console.error("Error getting dashboard data: ", data.error);
					}
				},
			},
		];
	}, []);
	const t1 = miniCardTime(30);
	const { selectedPeriod, setSelectedPeriod } = useStore();
	const tButtonStyle: SxProps<Theme> = {
		backgroundColor: "white",
		p: 0.7,
		px: 1.3,
		textTransform: "none",
		"&.Mui-selected": {
			backgroundColor: "#1976d2",
			color: "white",
			"&:hover": {
				backgroundColor: "#1565c0",
			},
		},
		fontWeight: 400,
		letterSpacing: "initial",
	};
	return (
		<div
			style={{
				height: "100%",
				width: "100%",
				display: "inline-block",
			}}
		>
			<Stack direction={"row"} gap={2} alignContent={"end"} textAlign={"end"}>
				<ToggleButtonGroup
					value={selectedPeriod}
					exclusive
					onChange={(
						_e: React.MouseEvent<HTMLElement>,
						newPeriod: "1d" | "1w" | "1m" | null,
					) => {
						if (newPeriod === "1d" || newPeriod == "1w" || newPeriod == "1m") {
							setSelectedPeriod(newPeriod);
						}
					}}
					sx={{
						alignContent: "center",
						textAlign: "center",
					}}
				>
					<ToggleButton
						value="1d"
						aria-label="left aligned"
						disableRipple
						sx={tButtonStyle}
					>
						d
					</ToggleButton>
					<ToggleButton
						value="1w"
						aria-label="centered"
						disableRipple
						sx={tButtonStyle}
					>
						w
					</ToggleButton>
					<ToggleButton
						value="1m"
						aria-label="right aligned"
						disableRipple
						sx={tButtonStyle}
					>
						m
					</ToggleButton>
				</ToggleButtonGroup>
				<IconButton>
					<MoreHorizIcon />
				</IconButton>
			</Stack>
			<Grid container borderRadius={0} spacing={0.8} padding={1}>
				{/* site visits today */}
				<Grid size={6}>
					<TopKpi title="Total site visits" content={t1} />
				</Grid>

				{/* time usage today */}
				<Grid size={6}>
					<TopKpi title="Total time usage" content={t1} />
				</Grid>

				{/* Total block groups active/inactive */}
				<Grid size={12}>
					<TopKpi title={"Total block groups"} content={t1} />
				</Grid>
			</Grid>
		</div>
	);
}
