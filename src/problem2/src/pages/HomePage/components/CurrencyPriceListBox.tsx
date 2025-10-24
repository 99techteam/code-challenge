import Select, { type OptionProps, type SingleValue, type SingleValueProps, components } from "react-select"
import { getTokenImage } from "../../../utils/tokenUtils"
import type { CurrencyPrice } from "../../../services/token/tokenService"
import { cn } from "../../../utils/tailwindUtils"
import { getStandardCurrency } from "../../../utils/common"

export interface ListBoxProps<T> {
    name?: string;
    value: T | undefined;
    onChange?: (change: SingleValue<T>) => void;
    onBlur?: () => void;
    items: T[];
    className?: string;
    showIndicator?: boolean;
    placeholder?: string
    getOptionLabel: (value: T) => string;
    getOptionValue: (value: T) => any
    isDisabled?: boolean
}

function CurrencyOption({
    data, isFocused, isSelected, innerProps, innerRef
}: OptionProps<CurrencyPrice, false>) {
    const currency = getStandardCurrency(data.currency)
    const imgUrl = getTokenImage(currency)

    return <div ref={innerRef} {...innerProps} className={cn("py-2 px-3 items-center flex cursor-pointer", {
        "bg-blue-400 text-white": isSelected,
        'bg-gray-100 text-black': isFocused && !isSelected
    })}>
        <div className="flex gap-x-2 items-center w-2/3">
            <img src={imgUrl} className="w-5 h-5" alt="currency icon" />
            <p>{currency}</p>
        </div>
        <p className="flex-1 text-right truncate">{'$' + parseFloat(data.price || '0').toFixed(2) || 'N/A'}</p>
    </div>
}

function CurrencySingleValue(props: SingleValueProps<CurrencyPrice>) {
    const { data } = props
    const currency = getStandardCurrency(data.currency)
    const imgUrl = getTokenImage(currency)
    return <components.SingleValue {...props}>
        <div className="flex items-center gap-x-2">
            <img src={imgUrl} alt="currency icon" className="w-5 h-5" />
            <span className="font-medium">{currency}</span>
        </div>

    </components.SingleValue>
}

export function CurrencyPriceListBox({
    value,
    name,
    onChange,
    onBlur,
    getOptionLabel,
    getOptionValue,
    items,
    className,
    placeholder,
    isDisabled
}: ListBoxProps<CurrencyPrice>) {
    return (
        <div className={cn('w-64', className)}>
            <Select
                isDisabled={isDisabled}
                name={name}
                onChange={value => onChange?.(value)}
                onBlur={onBlur}
                getOptionLabel={getOptionLabel}
                getOptionValue={getOptionValue}
                options={items}
                value={value}
                components={{
                    Option: CurrencyOption,
                    SingleValue: CurrencySingleValue,
                    IndicatorSeparator: null,
                    DropdownIndicator: null
                }}
                classNames={{
                    menu: () => "mt-1 border border-gray-200 rounded-lg shadow-lg bg-white",
                    placeholder: () => "text-gray-400",
                }}
                classNamePrefix="react-select"
                placeholder={placeholder ?? "Select a currency"}
            />
        </div>
    );
}