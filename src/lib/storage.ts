export interface CalculationHistory {
  id: string;
  type: 'simple' | 'compound' | 'sip' | 'mutualfund' | 'swp' | 'emi' | 'loancompare' | 'homeloan' | 'lumpsum' | 'ppf' | 'fd' | 'rd' | 'goalplanning' | 'retirement' | 'education' | 'hra' | 'ssy';
  date: string;
  inputs: Record<string, number | string>;
  results: Record<string, number>;
  note?: string;
}

const STORAGE_KEY = 'calculator_history';

export const saveCalculation = (calculation: Omit<CalculationHistory, 'id' | 'date'>) => {
  const history = getHistory();
  const newCalculation: CalculationHistory = {
    ...calculation,
    id: Date.now().toString(),
    date: new Date().toISOString(),
  };
  history.unshift(newCalculation);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
  return newCalculation;
};

export const getHistory = (): CalculationHistory[] => {
  const stored = localStorage.getItem(STORAGE_KEY);
  return stored ? JSON.parse(stored) : [];
};

export const deleteCalculation = (id: string) => {
  const history = getHistory();
  const filtered = history.filter(item => item.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
};

export const clearHistory = () => {
  localStorage.removeItem(STORAGE_KEY);
};
