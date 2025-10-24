import { number, object, string, type InferType } from "yup";

export const tokenSwapFormSchema = object({
    inputAmount: number().typeError('Must be a number').positive('The number must be greater than 0').required('Input amount is required'),
    fromCurrency: object().shape({
        currency: string(),
        date: string(),
        price: string()
    }).transform((value, orgValue) => orgValue.currency === '' ? null : value).required('From currency is required'),
    toCurrency: object().shape({
        date: string(),
        currency: string(),
        price: string()
    }).transform((value, orgValue) => orgValue.currency === '' ? null : value).required('To currency is required')
}).required()

export type TokenSwapFormType = InferType<typeof tokenSwapFormSchema>