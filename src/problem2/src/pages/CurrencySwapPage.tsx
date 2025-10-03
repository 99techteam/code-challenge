import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useTokenPrices } from '../features/currency-swap/hooks/useTokenPrices';
import {
    computeOutput,
    formatInput,
} from '../features/currency-swap/utils/precision';
import CustomDropdown from '../features/currency-swap/components/CustomDropdown';
import SwapButton from '../features/currency-swap/components/SwapButton';

export default function CurrencySwap() {
    const { tokens, loading, error } = useTokenPrices();
    const {
        register,
        watch,
        handleSubmit,
        setValue,
        formState: { errors },
    } = useForm({ defaultValues: { from: '', to: '', amount: '' } });

    const [validationErrors, setValidationErrors] = useState<{
        from?: string;
        to?: string;
    }>({});

    const [isSubmitting, setIsSubmitting] = useState(false);

    if (loading)
        return <div className="text-center p-10">Loading prices...</div>;

    if (error) {
        return (
            <div className="text-red-600 flex items-center">
                {error.message}
            </div>
        );
    }

    const from = watch('from') || tokens[0]?.id;

    const fromCurrency = tokens.find((t) => t.id === from);
    const to = watch('to') || tokens[2]?.id;

    const toCurrency = tokens.find((t) => t.id === to);
    const amount = parseFloat(watch('amount')); // parseFloat để chuyển string sang number

    const output = computeOutput(from, to, amount, tokens);

    const onSubmit = async (data: any) => {
        // Validate custom dropdowns
        const newErrors: { from?: string; to?: string } = {};

        if (!from) {
            newErrors.from = 'Select a currency';
        }
        if (!to) {
            newErrors.to = 'Select a currency';
        }
        if (from && to && from === to) {
            newErrors.to = 'Cannot swap to same token';
        }

        if (Object.keys(newErrors).length > 0) {
            setValidationErrors(newErrors);
            return;
        }

        // Start loading
        setIsSubmitting(true);

        try {
            // Simulate API call with timeout delay (1 seconds)
            await new Promise((resolve) => setTimeout(resolve, 1000));

            console.log('Swapping:', data);
            alert(
                `✅ Success! \n Swapped ${data.amount} ${
                    fromCurrency?.currency
                } → ${output.toFixed(4)} ${toCurrency?.currency}`
            );
        } catch (error) {
            console.error('Swap failed:', error);
            alert('Swap failed. Please try again.');
        } finally {
            // Stop loading
            setIsSubmitting(false);
        }
    };

    return (
        <div className="min-w-[360px] max-w-[480px] max-h-[65vh] w-full mx-auto my-10 bg-white shadow-xl rounded-2xl p-6 space-y-2">
            <h1 className="text-2xl font-bold text-center text-[var(--colors-text)]">
                💱 Currency Swap
            </h1>

            <form onSubmit={handleSubmit(onSubmit)}>
                {/* FROM */}
                <div className="border-0 border-b-0 border-gray-300 rounded-t-[20px] px-4 py-4 space-y-1">
                    <div className="block text-sm font-medium text-[var(--colors-textSubtle)]">
                        From:
                    </div>
                    <label className="block relative font-medium bg-[var(--colors-background)] border border-gray-100 rounded-[20px] px-4 py-4">
                        <div className="relative flex flex-nowrap flex-row-reverse gap-2">
                            <input
                                title="Token Amount"
                                type="text"
                                autoComplete="off"
                                inputMode="decimal"
                                pattern="^[0-9]*[.,]?[0-9]*$"
                                autoCorrect="off"
                                minLength={1}
                                maxLength={79}
                                spellCheck="false"
                                placeholder="0.00"
                                {...register('amount', {
                                    required: 'Amount is required',
                                    max: {
                                        value: 1e12,
                                        message: 'Amount was too large',
                                    },
                                })}
                                onChange={(e) => {
                                    const sanitizedValue = formatInput(
                                        e.target.value
                                    );
                                    setValue('amount', sanitizedValue);
                                }}
                                className="w-0 relative bg-[var(--colors-background)] text-[var(--colors-text)] flex-1 whitespace-nowrap outline-none mt-1 px-2 pb-2 text-[24px] font-[600] text-right"
                            />

                            <CustomDropdown
                                tokens={tokens}
                                value={from}
                                typeCard="from"
                                onChange={(value) => {
                                    setValue('from', value);
                                    setValidationErrors((prev) => ({
                                        ...prev,
                                        from: undefined,
                                    }));
                                }}
                                disabled={to ? [to] : []}
                            />
                        </div>
                        <div
                            className={`absolute right-0 bottom-[12px] bg-transparent ${
                                amount >= 0 ? '' : 'hidden'
                            }`}
                        >
                            <div className="flex justify-end mr-6">
                                <div className="text-[var(--colors-textSubtle)] font-normal leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis text-[12px]">
                                    ~
                                    {fromCurrency?.price
                                        ? `${(
                                              fromCurrency.price * amount
                                          ).toFixed(4)}`
                                        : `${(tokens[0].price * amount).toFixed(
                                              4
                                          )}`}
                                </div>
                                <div className="ml-1 text-[var(--colors-textSubtle)] font-normal leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis text-[12px]">
                                    USD
                                </div>
                            </div>
                        </div>
                    </label>

                    {errors.amount && (
                        <p className="text-red-500 text-xs">
                            {errors.amount.message as string}
                        </p>
                    )}
                </div>

                {/* SWAP BUTTON */}
                <SwapButton
                    from={from}
                    to={to}
                    onClick={(from, to) => {
                        if (from && to) {
                            setValue('from', to);
                            setValue('to', from);
                            setValidationErrors({});
                        }
                    }}
                />

                {/* TO */}
                <div className="border-0 border-t-0 border-gray-300 rounded-b-[20px] px-3 py-1 space-y-1">
                    <label className="block text-sm font-medium text-[var(--colors-textSubtle)]">
                        To:
                    </label>
                    <div className="relative font-medium bg-[var(--colors-background)] border border-gray-100 rounded-[20px] px-4 py-4">
                        <div className="relative flex flex-nowrap flex-row-reverse gap-2">
                            <input
                                title="Token Amount"
                                type="text"
                                autoComplete="off"
                                inputMode="decimal"
                                pattern="^[0-9]*[.,]?[0-9]*$"
                                autoCorrect="off"
                                minLength={1}
                                maxLength={79}
                                spellCheck="false"
                                placeholder="0.00"
                                value={output > 0 ? output.toFixed(4) : ''}
                                onChange={() => {}}
                                readOnly
                                className="w-0 relative bg-[var(--colors-background)] text-[var(--colors-text)] flex-1 whitespace-nowrap outline-none mt-1 px-2 pb-2 text-[24px] font-[600] text-right"
                            />

                            <CustomDropdown
                                tokens={tokens}
                                value={to}
                                typeCard="to"
                                onChange={(value) => {
                                    setValue('to', value);
                                    setValidationErrors((prev) => ({
                                        ...prev,
                                        to: undefined,
                                    }));
                                }}
                                disabled={from ? [from] : []}
                            />

                            {(errors.to || validationErrors.to) && (
                                <p className="text-red-500 text-xs">
                                    {(errors.to?.message as string) ||
                                        validationErrors.to}
                                </p>
                            )}
                        </div>
                        <div
                            className={`absolute right-0 bottom-[12px] bg-transparent ${
                                amount >= 0 ? '' : 'hidden'
                            }`}
                        >
                            <div className="flex justify-end mr-6">
                                <div className="text-[var(--colors-textSubtle)] font-normal leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis text-[12px]">
                                    ~
                                    {toCurrency?.price
                                        ? `${(
                                              toCurrency.price * output
                                          ).toFixed(4)}`
                                        : `${(tokens[2].price * output).toFixed(
                                              4
                                          )}`}
                                </div>
                                <div className="ml-1 text-[var(--colors-textSubtle)] font-normal leading-[1.5] whitespace-nowrap overflow-hidden text-ellipsis text-[12px]">
                                    USD
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-6 px-3 text-sm">
                    {/* ACTION */}
                    <button
                        type="submit"
                        disabled={isSubmitting}
                        className={`relative inline-flex items-center justify-center border-0 rounded-2xl shadow-[inset_0px_-1px_0px_0px_rgba(14,14,44,0.4)] cursor-pointer font-sans text-lg font-semibold leading-none tracking-wide outline-none transition-colors duration-200 h-12 px-6 w-full ${
                            isSubmitting
                                ? 'bg-gray-400 cursor-not-allowed opacity-70'
                                : 'bg-[var(--colors-primary)] hover:opacity-90'
                        } text-[var(--colors-cardBackground)]`}
                    >
                        {isSubmitting ? (
                            <div className="flex items-center gap-2">
                                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                                <span>Swapping...</span>
                            </div>
                        ) : (
                            'Swap'
                        )}
                    </button>
                    {/* OUTPUT */}
                    {from && to && amount > 0 && (
                        <div className="p-1 text-left text-[var(--colors-textSubtle)] leading-[1.5]">
                            <p>{`${amount} ${fromCurrency?.currency} ~ ${output} ${toCurrency?.currency}`}</p>
                        </div>
                    )}
                </div>
            </form>
        </div>
    );
}
