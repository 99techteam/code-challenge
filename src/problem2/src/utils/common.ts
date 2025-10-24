export const getStandardCurrency = (value: string, deliminator: string = '/') => {
    return value.split(deliminator)[0]
}