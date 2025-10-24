
import { Controller, useForm, type SubmitHandler } from "react-hook-form";
import { yupResolver } from "@hookform/resolvers/yup";
import { IconReplace } from '@tabler/icons-react'

import { tokenSwapFormSchema, type TokenSwapFormType } from "./TokenSwapForm.schema";
import { CurrencyPriceListBox } from "./CurrencyPriceListBox";
import type { CurrencyPrice } from "../../../services/token/tokenService";
import { getStandardCurrency } from "../../../utils/common";


interface TokenSwapFormProps {
    currencyPriceList: CurrencyPrice[]
}

const TokenSwapForm = ({ currencyPriceList }: TokenSwapFormProps) => {
    const { handleSubmit, setValue, register, trigger, formState, control, watch } = useForm<TokenSwapFormType>({
        defaultValues: {
            inputAmount: 0,
            fromCurrency: {
                currency: '',
                date: '',
                price: ''
            },
            toCurrency: {
                currency: '',
                date: '',
                price: ''
            }
        },
        mode: 'onChange',
        resolver: yupResolver(tokenSwapFormSchema)
    })

    const { errors } = formState
    console.log({ errors });

    const fromCurrency = watch('fromCurrency')
    const toCurrency = watch('toCurrency')
    const inputAmount = watch('inputAmount')

    const onSubmit: SubmitHandler<TokenSwapFormType> = (data) => {
        console.log(data);
    };

    const calculateConversionRate = () => {
        if (!fromCurrency.currency || !toCurrency.currency) {
            return '0'
        }

        const fromCurrencyPrice = typeof fromCurrency?.price === 'number' ? Number(fromCurrency.price) : 0
        const toCurrencyPrice = typeof toCurrency?.price === 'number' ? Number(toCurrency?.price) : 0
        const conversionRate = inputAmount * fromCurrencyPrice / toCurrencyPrice
        return String(conversionRate)
    }

    const onChangeReverseCurrency = async () => {
        const isCurrenciesValid = await trigger(['fromCurrency', 'toCurrency'])
        if (!isCurrenciesValid) {
            return;
        }
        const fromCurrencyValue = { ...fromCurrency }
        setValue('fromCurrency', toCurrency)
        setValue('toCurrency', fromCurrencyValue)
    }

    return (
        <div className="flex items-center justify-center min-h-screen bg-gray-900">
            <form
                onSubmit={handleSubmit(onSubmit)}
                className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-sm"
            >
                <h5 className="text-xl font-semibold text-white mb-4 text-center">
                    Swap
                </h5>

                <div>
                    <Controller
                        name='fromCurrency'
                        control={control}
                        render={({ field }) =>
                            <CurrencyPriceListBox
                                {...field}
                                getOptionValue={currentPrice => (currentPrice as CurrencyPrice)?.currency || 'Select from currency'}
                                getOptionLabel={currentPrice => getStandardCurrency((currentPrice as CurrencyPrice).currency || '')}
                                placeholder="Select from currency"
                                items={currencyPriceList}
                                value={currencyPriceList.find(item => item.currency === fromCurrency?.currency)}
                                className='w-full mb-2'
                            />
                        }
                    />
                    {errors.fromCurrency && (
                        <p className="text-red-400 text-sm mb-3">
                            {errors.fromCurrency.message}
                        </p>
                    )}

                    <input
                        type="text"
                        className="w-full p-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                        placeholder="Enter amount"
                        {...register('inputAmount')}
                    />

                    {errors.inputAmount && (
                        <p className="text-red-400 text-sm mt-2">
                            {errors.inputAmount.message}
                        </p>
                    )}

                </div>
                <div className="flex justify-center py-4">
                    <IconReplace className="cursor-pointer text-white hover:text-blue-300" onClick={onChangeReverseCurrency} size={24} />
                </div>

                < div className="mb-4">
                    <Controller
                        name='toCurrency'
                        control={control}
                        render={({ field }) =>
                            <CurrencyPriceListBox
                                {...field}
                                isDisabled={!fromCurrency.currency}
                                getOptionValue={currentPrice => (currentPrice as CurrencyPrice)?.currency || 'Select to currency'}
                                getOptionLabel={currentPrice => getStandardCurrency((currentPrice as CurrencyPrice).currency || '')}
                                placeholder="Select to currency"
                                items={currencyPriceList}
                                value={currencyPriceList.find(item => item.currency === toCurrency?.currency)}
                                className='w-full mb-2 cursor-not-allowed'
                            />
                        }
                    />
                    {errors.toCurrency && (
                        <p className="text-red-400 text-sm mb-3">
                            {errors.toCurrency.message}
                        </p>
                    )}

                    <input
                        type="text"
                        disabled={true}
                        value={calculateConversionRate()}
                        className="select-none cursor-not-allowed w-full p-2 mb-2 rounded bg-gray-700 text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                </div>

                <button
                    type="submit"
                    className="cursor-pointer w-full bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 rounded transition duration-200 mt-4"
                >
                    Confirm Swap
                </button>
            </form>
        </div>
    );
};

export default TokenSwapForm;