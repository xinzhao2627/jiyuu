import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";
import { uiStyles } from "@renderer/assets/shared/uiStyles";

interface TopKpiProps {
	title: string;
	content: React.JSX.Element;
}

export default function TopKpi({
	title,
	content,
}: TopKpiProps): React.JSX.Element {
	return (
		<Card
			sx={{
				...uiStyles.kpiCard,
				minHeight: 120,
			}}
		>
			<CardContent>
				<Stack direction={"row"}>
					<Typography
						mb={1}
						variant="body2"
						color="text.secondary"
						fontWeight={600}
					>
						{title}
					</Typography>
				</Stack>
				{content}
			</CardContent>
		</Card>
	);
}
