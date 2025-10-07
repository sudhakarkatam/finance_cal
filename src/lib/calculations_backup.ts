export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  time: number
) => {
  const interest = (principal * rate * time) / 100;
  const total = principal + interest;
  return { interest, total, principal };
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  frequency: number = 1
) => {
  const amount = principal * Math.pow(1 + rate / (100 * frequency), frequency * time);
  const interest = amount - principal;
  return { interest, total: amount, principal };
};

export const calculateSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number
) => {
  const months = years * 12;
  const monthlyRate = expectedReturn / (12 * 100);
  
  const futureValue = monthlyInvestment * 
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) * 
    (1 + monthlyRate);
  
  const invested = monthlyInvestment * months;
  const returns = futureValue - invested;
  
  return { invested, returns, total: futureValue };
};

export const calculateMutualFund = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number
) => {
  return calculateSIP(monthlyInvestment, expectedReturn, years);
};

export const calculateSWP = (
  investmentAmount: number,
  withdrawalPerMonth: number,
  expectedReturn: number,
  years: number
) => {
  const months = years * 12;
  const monthlyRate = expectedReturn / (12 * 100);
  
  let balance = investmentAmount;
  let totalWithdrawn = 0;
  
  for (let i = 0; i < months; i++) {
    balance = balance * (1 + monthlyRate) - withdrawalPerMonth;
    totalWithdrawn += withdrawalPerMonth;
    if (balance <= 0) break;
  }
  
  return {
    invested: investmentAmount,
    totalWithdrawn,
    finalBalance: Math.max(0, balance)
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat('en-IN').format(Math.round(num));
};
