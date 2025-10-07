export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  time: number
) => {
  const interest = (principal * rate * time) / 100;
  const total = principal + interest;
  return {
    interest: Math.round(interest),
    total: Math.round(total),
    principal: Math.round(principal)
  };
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  frequency: number = 1
) => {
  const amount = principal * Math.pow(1 + rate / (100 * frequency), frequency * time);
  const interest = amount - principal;
  return {
    interest: Math.round(interest),
    total: Math.round(amount),
    principal: Math.round(principal)
  };
};

export const calculateSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number
) => {
  const months = years * 12;
  const monthlyRate = expectedReturn / (12 * 100);

  // Standard SIP formula: FV = P * (((1 + r)^n - 1) / r) * (1 + r)
  const futureValue = monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const invested = monthlyInvestment * months;
  const returns = futureValue - invested;

  return {
    invested: Math.round(invested),
    returns: Math.round(returns),
    total: Math.round(futureValue)
  };
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
    invested: Math.round(investmentAmount),
    totalWithdrawn: Math.round(totalWithdrawn),
    finalBalance: Math.round(Math.max(0, balance))
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

export const calculateGoalPlanning = (
  goalAmount: number,
  targetYears: number,
  currentSavings: number,
  monthlyContribution: number,
  expectedReturn: number,
  inflationRate: number = 0,
  stepUpPercentage: number = 0
) => {
  const months = targetYears * 12;
  const monthlyRate = expectedReturn / (12 * 100);

  // Adjust goal amount for inflation if enabled
  const inflationAdjustedGoal = inflationRate > 0
    ? goalAmount * Math.pow(1 + inflationRate / 100, targetYears)
    : goalAmount;

  // Calculate future value of current savings
  const futureSavings = currentSavings * Math.pow(1 + expectedReturn / 100, targetYears);

  // Calculate future value of monthly contributions with step-up only
  let futureContributions = 0;
  let currentMonthlyContrib = monthlyContribution;

  for (let year = 1; year <= targetYears; year++) {
    const yearlyContribution = currentMonthlyContrib * 12;

    // Future value of this year's contributions
    const yearsRemaining = targetYears - year;
    const futureValueOfYearContribution = yearlyContribution *
      Math.pow(1 + expectedReturn / 100, yearsRemaining);

    futureContributions += futureValueOfYearContribution;

    // Apply step-up for next year only (no inflation on contributions)
    if (stepUpPercentage > 0 && year < targetYears) {
      currentMonthlyContrib *= (1 + stepUpPercentage / 100);
    }
  }

  const totalAchieved = futureSavings + futureContributions;

  // Calculate if inflation-adjusted goal is met
  const goalMet = totalAchieved >= inflationAdjustedGoal;
  const shortfall = goalMet ? 0 : inflationAdjustedGoal - totalAchieved;

  // Calculate required monthly contribution to reach inflation-adjusted goal
  let requiredMonthlyContribution = monthlyContribution;

  if (!goalMet) {
    // Use the SIP formula to calculate required monthly investment
    const futureValueFactor = (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

    // Account for current savings growth
    const futureSavingsValue = currentSavings * Math.pow(1 + expectedReturn / 100, targetYears);

    // Calculate remaining amount needed after current savings grow
    const remainingGoal = Math.max(0, inflationAdjustedGoal - futureSavingsValue);

    if (remainingGoal > 0 && futureValueFactor > 0) {
      requiredMonthlyContribution = remainingGoal / futureValueFactor;
    }
  }

  return {
    futureSavings: Math.round(futureSavings),
    futureContributions: Math.round(futureContributions),
    totalAchieved: Math.round(totalAchieved),
    shortfall: Math.round(shortfall),
    requiredMonthlyContribution: Math.round(Math.max(requiredMonthlyContribution, 0)),
    goalMet,
    inflationAdjustedGoal: Math.round(inflationAdjustedGoal)
  };
};
