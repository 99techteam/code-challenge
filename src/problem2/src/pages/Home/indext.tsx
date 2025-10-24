import { useEffect, useState } from "react"
import { fetchCurrencyPriceList, type CurrencyPrice } from "../../services/token/tokenService"
import SwapTokenForm from "./components/SwapTokenForm"

const HomePage = () => {
    const [currencyPriceList, setCurrencyPriceList] = useState<CurrencyPrice[]>([])

    useEffect(() => {
        (async function () {
            const currencyPriceListData = await fetchCurrencyPriceList()
            setCurrencyPriceList(currencyPriceListData)
        })()
    }, [])

    return <div>
        <SwapTokenForm />
    </div>
}

export default HomePage