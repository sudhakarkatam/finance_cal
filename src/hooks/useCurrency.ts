import { useCurrencyContext, CURRENCIES, CurrencyCode } from '../context/CurrencyContext';

export const useCurrency = (forceCurrency?: CurrencyCode) => {
    const context = useCurrencyContext();

    // If forceCurrency is provided, use that config.
    // Otherwise, use the global context currency.
    const activeCurrency = forceCurrency
        ? CURRENCIES[forceCurrency]
        : context.currency;

    const formatAmount = (amount: number) => {
        return new Intl.NumberFormat(activeCurrency.locale, {
            style: 'currency',
            currency: activeCurrency.code,
            maximumFractionDigits: 0,
        }).format(amount);
    };

    return {
        ...activeCurrency,
        formatAmount,
        setGlobalCurrency: context.setCurrency,
        globalCurrencyCode: context.currency.code,
    };
};
