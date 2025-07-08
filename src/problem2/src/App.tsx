import React, { useEffect, useState } from 'react'
import './App.css'
import Select from "react-select"

interface Currency {
    currency: string,
    date: string,
    iconUrl: string,
    price: number
}

interface ApiCurrency {
    currency: string
    date: string
    price: number
}

interface SwapSectionProps {
    title: string;
    maxAmount?: string;
    selectedCurrency: Currency | null;
    onCurrencyChange: (value: Currency) => void;
    currencies: Currency[];
    amount: string;
    onAmountChange: (value: string) => void;
}

const SwapSection: React.FC<SwapSectionProps> =
    ({ title, maxAmount, selectedCurrency, onCurrencyChange, currencies, amount, onAmountChange }) => {

        const customOption = (data: Currency) => (
            <div className='currency-option'>
                <img className='currency-icon'
                    src={data.iconUrl}
                    alt={data.currency}
                />
                <span>{data.currency}</span>
            </div>
        );

        const customSingleValue = (data: { data: Currency }) => (
            <div className='currency-selected'>
                <img className='currency-icon'
                    src={data.data.iconUrl}
                    alt={data.data.currency}
                />
                <div className='currency-info'>
                    <div className='currency-amount'>{data.data.currency}</div>
                    <div className='currency-rate'>1 {data.data.currency}=${data.data.price.toFixed(2)}</div>
                </div>
            </div>
        );

        return (
            <div className='swap-section'>
                <div className='section-header'>
                    <span className='section-title'>{title}</span>
                </div>
                
                <div className='section-content'>
                    <div className='amount-input-section'>
                        <input 
                            type='number'
                            className='amount-input'
                            value={amount}
                            onChange={(e) => onAmountChange(e.target.value)}
                            placeholder='Enter amount'
                        />
                    </div>

                    <div className='currency-selector'>
                        <Select 
                            className='currency-select'
                            classNamePrefix='select'
                            value={selectedCurrency}
                            onChange={(selectedOption: Currency | null) =>
                                selectedOption && onCurrencyChange(selectedOption)
                            }
                            options={currencies}
                            formatOptionLabel={customOption}
                            components={{ SingleValue: customSingleValue }}
                            getOptionValue={(option) => option.currency}
                            isSearchable={false}
                        />
                    </div>
                </div>
            </div>
        )
    }

function App() {
    const [inputCurrency, setInputCurrency] = useState<Currency | null>(null)
    const [outputCurrency, setOutputCurrency] = useState<Currency | null>(null)
    const [listCurrency, setListCurrency] = useState<Currency[]>([])
    const [sellAmount, setSellAmount] = useState<string>("825")
    
    const buyAmount = outputCurrency && inputCurrency && sellAmount ? 
        (parseFloat(sellAmount) * inputCurrency.price / outputCurrency.price).toFixed(0) : "0"
    
    useEffect(() => {
        const fetchCurrencies = async () => {
            try {
                const response = await fetch('https://interview.switcheo.com/prices.json')
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`)
                }
                const data = await response.json()
                
                const latestCurrencies = data
                    .sort((a: ApiCurrency, b: ApiCurrency) => new Date(b.date).getTime() - new Date(a.date).getTime())
                    .filter((currency: ApiCurrency, index: number, self: ApiCurrency[]) => 
                        index === self.findIndex(c => c.currency === currency.currency)
                    )
                
                const processedCurrencies = latestCurrencies.map((curr: ApiCurrency) => ({
                    ...curr,
                    iconUrl: `https://raw.githubusercontent.com/Switcheo/token-icons/main/tokens/${curr.currency}.svg`
                }))
                
                setListCurrency(processedCurrencies)
            } catch (error) {
                console.error('Failed to fetch currencies:', error)
                setListCurrency([])
            }
        }
        
        fetchCurrencies()
        
        const interval = setInterval(fetchCurrencies, 30000)
        
        return () => clearInterval(interval)
    }, [])
    
    useEffect(() => {
        if (listCurrency.length > 0 && !inputCurrency && !outputCurrency) {
            const usdt = listCurrency.find(c => c.currency === 'USDT')
            const bnb = listCurrency.find(c => c.currency === 'BNB')
            
            if (usdt && bnb) {
                setInputCurrency(usdt)
                setOutputCurrency(bnb)
            }
        }
    }, [listCurrency, inputCurrency, outputCurrency])

    function swapCurrency() {
        const temp = inputCurrency
        setInputCurrency(outputCurrency)
        setOutputCurrency(temp)
    };

    return (
        <div className='app'>
            <div className='swap-container'>
                <SwapSection 
                    title="Selling"
                    maxAmount="$20"
                    selectedCurrency={inputCurrency}
                    onCurrencyChange={setInputCurrency}
                    currencies={listCurrency}
                    amount={sellAmount}
                    onAmountChange={setSellAmount}
                />
                
                <SwapSection 
                    title="Buying"
                    selectedCurrency={outputCurrency}
                    onCurrencyChange={setOutputCurrency}
                    currencies={listCurrency}
                    amount={buyAmount}
                    onAmountChange={() => {}}
                />
                
                <button className='swap-action-btn' onClick={swapCurrency}>
                    Swap
                </button>
            </div>
        </div>
    )
}

export default App
