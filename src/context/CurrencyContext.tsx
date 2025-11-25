import React, { createContext, useContext, useState, useEffect } from 'react';

export type CurrencyCode = 'INR' | 'USD' | 'EUR' | 'GBP' | 'JPY';

export interface CurrencyConfig {
    code: CurrencyCode;
    symbol: string;
    locale: string;
    name: string;
}

export const CURRENCIES: Record<CurrencyCode, CurrencyConfig> = {
    INR: { code: 'INR', symbol: '₹', locale: 'en-IN', name: 'Indian Rupee' },
    USD: { code: 'USD', symbol: '$', locale: 'en-US', name: 'US Dollar' },
    EUR: { code: 'EUR', symbol: '€', locale: 'de-DE', name: 'Euro' },
    GBP: { code: 'GBP', symbol: '£', locale: 'en-GB', name: 'British Pound' },
    JPY: { code: 'JPY', symbol: '¥', locale: 'ja-JP', name: 'Japanese Yen' },
};

interface CurrencyContextType {
    currency: CurrencyConfig;
    setCurrency: (code: CurrencyCode) => void;
}

export const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const CurrencyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [currencyCode, setCurrencyCode] = useState<CurrencyCode>(() => {
        const saved = localStorage.getItem('preferred_currency');
        // Validate if saved currency exists in our config, else default to INR
        return (saved && CURRENCIES[saved as CurrencyCode]) ? (saved as CurrencyCode) : 'INR';
    });

    const setCurrency = (code: CurrencyCode) => {
        setCurrencyCode(code);
        localStorage.setItem('preferred_currency', code);
    };

    const currency = CURRENCIES[currencyCode];

    return (
        <CurrencyContext.Provider value={{ currency, setCurrency }}>
            {children}
        </CurrencyContext.Provider>
    );
};

export const useCurrencyContext = () => {
    const context = useContext(CurrencyContext);
    if (!context) {
        throw new Error('useCurrencyContext must be used within a CurrencyProvider');
    }
    return context;
};
