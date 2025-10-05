import Card from "@mui/material/Card";
import CardContent from "@mui/material/CardContent";
import Typography from "@mui/material/Typography";
import { Stack } from "@mui/material";

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
				minWidth: 275,
				minHeight: 100,
				padding: 1,
			}}
		>
			<CardContent>
				<Stack direction={"row"}>
					<Typography mb={1} variant="body1" fontWeight={400}>
						{title}
					</Typography>
				</Stack>
				{content}
			</CardContent>
		</Card>
	);
}
