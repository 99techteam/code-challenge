import React, { useState, useEffect, useMemo } from "react";
import DropDown from "react-dropdown";
import { handleOnlyNumberKeyPress } from "./utils/common-func";
import { data } from "./constants/data/currency";
import "./App.css";
import "react-dropdown/style.css";

function App() {
	const [input, setInput] = useState(0);
	const [output, setOutput] = useState(0);
	const [from, setFrom] = useState("USD");
	const [to, setTo] = useState("BLUR");
	const [message, setMessage] = useState();
	const [options, setOptions] = useState([]);

	const handleSubmit = (e) => {
		e.preventDefault();
		if (to === from) return setMessage("Please select another currency");
		const { price } = data.find((data) => data.currency === to);
		setOutput(input * price);
		setMessage("");
	};

	const handleChangeInput = (e) => {
		setInput(e.target.value);
	};

	useEffect(() => {
		const filterData = data.map((item) => item.currency);
		setOptions(filterData);
	}, []);

	return (
		<div className="App">
			<form onSubmit={handleSubmit} className="container">
				<h2>Swap</h2>
				<div className="content">
					<div className="input">
						<div className="input-item">
							<label>Amount to send</label>
							<input
								id="input-amount"
								onChange={handleChangeInput}
								required
								value={input}
								onKeyPress={handleOnlyNumberKeyPress}
							/>
						</div>
						<div className="input-item">
							<label>Amount to receive</label>
							<input id="output-amount" value={output} required />
						</div>
					</div>
					<div className="transfer">
						<div className="to">
							<DropDown
								options={options}
								value={from}
								placeholder="From"
								onChange={(e) => {
									setFrom(e.value);
								}}
							/>
						</div>
						<div className="to">
							<DropDown
								options={options}
								value={to}
								placeholder="To"
								onChange={(e) => {
									setTo(e.value);
								}}
							/>
						</div>
					</div>
				</div>
				<p className="message">{message}</p>
				<button>CONFIRM SWAP</button>
			</form>
		</div>
	);
}

export default App;
