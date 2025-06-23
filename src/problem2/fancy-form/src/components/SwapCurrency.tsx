import React, { useEffect, useState } from "react";
import {
	Box,
	Button,
	CircularProgress,
	IconButton,
	MenuItem,
	Paper,
	Select,
	TextField,
	Typography,
} from "@mui/material";
import SwapVertIcon from "@mui/icons-material/SwapVert";
import { useData } from "../hooks/useData";
import Image from "./Image";

interface IPriceData {
	currency: string;
	date: string;
	price: number;
}
const SwapCurrency = () => {
	const { data, isLoading, error } = useData<IPriceData[]>(import.meta.env.VITE_API_ENDPOINT);

	const [fromToken, setFromToken] = useState("");
	const [toToken, setToToken] = useState("");
	const [selling, setSelling] = useState("0");
	const [isSellingError, setIsSellingError] = useState(false);
	const [buying, setBuying] = useState(0);
	const [convertedRate, setConvertedRate] = useState<IPriceData[]>([]);
	const [isLoadingData, setIsLoadingData] = useState(isLoading);
	const [isConverting, setIsConverting] = useState(false);
	const [rotated, setRotated] = useState(false);

	const containerStyles = {
		minHeight: "100vh",
		width: "100%",
		background: isLoadingData
			? ""
			: "radial-gradient(circle at center, rgba(128, 0, 128, 0.2), #000000 90%)",
		display: "flex",
		justifyContent: "center",
		alignItems: "center",
		color: "#fff",
		fontFamily: "sans-serif",
		px: 2,
	};

	const onLoadingStyles = {
		display: "flex",
		flexDirection: "column",
		alignItems: "center",
		justifyContent: "center",
		gap: 2,
	};

	const swapIconStyles = {
		color: "white",
		backgroundColor: "#29293d",
		"&:hover": { backgroundColor: "#33334d" },
		position: "absolute",
		top: -20,
		transition: "transform 0.5s cubic-bezier(.4,2,.6,1)",
		transform: rotated ? "rotate(180deg)" : "rotate(0deg)",
	};

	const submitButtonStyles = {
		background: "linear-gradient(to right, #a66bff, #9156f4)",
		color: "white",
		fontWeight: "bold",
		borderRadius: 2,
		py: 1.5,
		fontSize: 16,
		"&:hover": {
			background: "linear-gradient(to right, #b17dff, #9d68f4)",
		},
	};

	const handleSellingChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		if (
			!event.target.value ||
			isNaN(Number(event.target.value)) ||
			parseFloat(event.target.value) < 0
		) {
			setIsSellingError(true);
		} else {
			setIsSellingError(false);
		}

		setSelling(event.target.value);
	};

	const handleConvertCurrency = (fromToken: string, toToken: string): void => {
		if (isSellingError) {
			alert("Please enter a valid amount to swap.");
			return;
		}

		setIsConverting(true);

		const fromPrice = convertedRate.find((token) => token.currency === fromToken)?.price || 0;
		const toPrice = convertedRate.find((token) => token.currency === toToken)?.price || 0;
		const convertedPrice = parseFloat(selling) * (fromPrice / toPrice);

		setTimeout(() => {
			setIsConverting(false);
			setBuying(convertedPrice);
		}, 1000);
	};

	const handleSwapCurrency = (): void => {
		const temp = fromToken;
		setFromToken(toToken);
		setToToken(temp);
		setRotated((prev) => !prev);

		handleConvertCurrency(toToken, temp);
	};

	useEffect(() => {
		if (data) {
			setConvertedRate(data);
			setFromToken(data[0].currency);
			setToToken(data[1].currency);
			setTimeout(() => {
				setIsLoadingData(false);
			}, 2000); // Simulate loading delay
		}
	}, [data]);

	if (error) {
		return (
			<Box sx={{ color: "red", textAlign: "center", mt: 4 }}>
				<Typography variant="h6">Error: {error}</Typography>
			</Box>
		);
	}
	return (
		<Box sx={containerStyles}>
			{isLoadingData ? (
				<Box sx={onLoadingStyles}>
					<CircularProgress />
					<Typography>Getting Data ...</Typography>
				</Box>
			) : (
				<Box>
					<Typography variant="h5" gutterBottom>
						Currency Swap
					</Typography>

					<Paper sx={{ p: 2, backgroundColor: "#1c1c2b", mb: 1, borderRadius: 2 }}>
						<Typography variant="body2" color="gray">
							I’m selling
						</Typography>
						<Box display="flex" alignItems="center" mt={1}>
							<Image name={fromToken || ""} />
							<TextField
								fullWidth
								variant="standard"
								type="text"
								value={selling}
								onChange={handleSellingChange}
								InputProps={{
									disableUnderline: !isSellingError,
									sx: { fontSize: 28, color: "white" },
								}}
								sx={{ ml: 1 }}
								error={isSellingError}
								helperText={isSellingError ? "Please enter a valid amount" : ""}
							/>
							<Select
								variant="standard"
								value={fromToken}
								onChange={(e) => setFromToken(e.target.value)}
								disableUnderline
								sx={{ ml: 2, color: "white" }}
							>
								{convertedRate.map((token, idx) => (
									<MenuItem key={token.price + idx} value={token.currency}>
										{token.currency}
									</MenuItem>
								))}
							</Select>
						</Box>
					</Paper>

					<Box
						textAlign="center"
						my={1}
						sx={{
							position: "relative",
						}}
					>
						<IconButton sx={swapIconStyles} onClick={handleSwapCurrency}>
							<SwapVertIcon />
						</IconButton>
					</Box>

					<Paper sx={{ p: 2, backgroundColor: "#1c1c2b", mb: 1, borderRadius: 2 }}>
						<Typography variant="body2" color="gray">
							To buy
						</Typography>
						<Box display="flex" alignItems="center" mt={1}>
							<Image name={toToken || ""} />
							<TextField
								fullWidth
								variant="standard"
								value={buying.toFixed(4)}
								InputProps={{
									disableUnderline: true,
									sx: { fontSize: 28, color: "white" },
								}}
								sx={{ ml: 1 }}
							/>
							<Select
								variant="standard"
								value={toToken}
								onChange={(e) => setToToken(e.target.value)}
								disableUnderline
								sx={{ ml: 2, color: "white" }}
							>
								{convertedRate.map((token, idx) => (
									<MenuItem key={token.price + idx} value={token.currency}>
										{token.currency}
									</MenuItem>
								))}
							</Select>
						</Box>
					</Paper>

					<Button
						fullWidth
						variant="contained"
						sx={submitButtonStyles}
						onClick={() => handleConvertCurrency(fromToken, toToken)}
						loading={isConverting}
					>
						Swap now
					</Button>
				</Box>
			)}
		</Box>
	);
};
export default SwapCurrency;
