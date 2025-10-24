import { useEffect, useState } from "react"
import { fetchCurrencyPriceList, type CurrencyPrice } from "../../services/token/tokenService"
import SwapTokenForm from "./components/TokenSwapForm"

const HomePage = () => {
    const [currencyPriceList, setCurrencyPriceList] = useState<CurrencyPrice[]>([])

    useEffect(() => {
        (async function () {
            const currencyPriceListData = await fetchCurrencyPriceList()
            const normalizedCurrencyPriceList = currencyPriceListData.map((item, index) => {
                return {
                    ...item,
                    currency: item.currency + '/' + index
                }
            })
            setCurrencyPriceList(normalizedCurrencyPriceList)
        })()
    }, [])

    return <div>
        <SwapTokenForm currencyPriceList={currencyPriceList} />
    </div>
}

export default HomePage