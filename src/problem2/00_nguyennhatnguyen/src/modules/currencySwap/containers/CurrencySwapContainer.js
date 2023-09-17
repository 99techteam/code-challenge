import { useEffect, useState } from 'react';
import Axios from 'axios';
import CurrencySwapForm from "../components/CurrencySwapForm";

const CurrencySwapContainer = () => {
    const [prices, setPrices] = useState([]);
    const [currencies, setCurrencies] = useState([]);

    useEffect(() => {
        Axios.get(
            `https://interview.switcheo.com/prices.json`)
            .then((res) => {
                const prs = [...new Map(res.data.map((m) => [m.currency, m])).values()];;
                setPrices(prs);
                setCurrencies([...new Set(res.data.map((pr) => {
                    return pr.currency;
                }))]);
            });
    }, []);

    return <CurrencySwapForm prices={prices}/>
};

export default CurrencySwapContainer;