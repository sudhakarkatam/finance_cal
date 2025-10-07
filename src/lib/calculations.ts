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
  years?: number,
  inflationRate: number = 0
) => {
  const monthlyRate = expectedReturn / (12 * 100);
  const monthlyInflationRate = inflationRate / (12 * 100);

  let balance = investmentAmount;
  let totalWithdrawn = 0;
  let totalInterest = 0;
  let months = 0;
  let depletionMonth: number | null = null;
  const amortizationData: Array<{
    month: number;
    startingBalance: number;
    interestEarned: number;
    withdrawal: number;
    endingBalance: number;
  }> = [];

  // If years is provided, use fixed period; otherwise, run until depletion
  const maxMonths = years ? years * 12 : 1000; // Safety limit for infinite case

  for (let i = 0; i < maxMonths; i++) {
    months = i + 1;
    const startingBalance = balance;
    const interestEarned = balance * monthlyRate;
    const endingBalance = balance * (1 + monthlyRate) - withdrawalPerMonth;

    // Track data for amortization table
    amortizationData.push({
      month: months,
      startingBalance: Math.round(startingBalance),
      interestEarned: Math.round(interestEarned),
      withdrawal: withdrawalPerMonth,
      endingBalance: Math.round(endingBalance)
    });

    totalInterest += interestEarned;
    totalWithdrawn += withdrawalPerMonth;
    balance = endingBalance;

    // Check if balance becomes negative
    if (balance <= 0 && !depletionMonth) {
      depletionMonth = months;
      if (!years) break; // Stop if no fixed period
    }

    if (years && months >= years * 12) break;
  }

  // Calculate inflation-adjusted final value
  const inflationAdjustedFinalValue = years && inflationRate > 0
    ? balance / Math.pow(1 + inflationRate / 100, years)
    : balance;

  // Calculate sustainable withdrawal if period is given
  let sustainableWithdrawal = 0;
  if (years) {
    const monthsInPeriod = years * 12;
    if (monthlyRate > 0) {
      // PMT formula for loan payment (rearranged for withdrawal)
      sustainableWithdrawal = investmentAmount * monthlyRate * Math.pow(1 + monthlyRate, monthsInPeriod) /
                             (Math.pow(1 + monthlyRate, monthsInPeriod) - 1);
    } else {
      sustainableWithdrawal = investmentAmount / monthsInPeriod;
    }
  }

  return {
    invested: Math.round(investmentAmount),
    totalWithdrawn: Math.round(totalWithdrawn),
    totalInterest: Math.round(totalInterest),
    finalBalance: Math.round(balance),
    inflationAdjustedFinalValue: Math.round(inflationAdjustedFinalValue),
    depletionMonth,
    sustainableWithdrawal: Math.round(sustainableWithdrawal),
    amortizationData: amortizationData.slice(0, 24), // First 24 months by default
    fullAmortizationData: amortizationData
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
  let excessContribution = 0;

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
  } else {
    // User is contributing more than needed - calculate how much they can reduce
    const excessCorpus = totalAchieved - inflationAdjustedGoal;

    // Calculate the excess contribution by working backwards
    // This is an approximation since step-up makes it complex
    const averageMonthlyRate = expectedReturn / (12 * 100);
    if (averageMonthlyRate > 0) {
      // Approximate excess contribution (this is a simplified calculation)
      excessContribution = excessCorpus / (Math.pow(1 + averageMonthlyRate, targetYears) - 1) / averageMonthlyRate / 12;
    }

    // More precise calculation for excess contribution
    let testContribution = monthlyContribution;
    let minContribution = 0;
    let maxContribution = monthlyContribution;

    // Binary search to find the minimum contribution needed
    for (let i = 0; i < 20; i++) { // Max 20 iterations for precision
      const midContribution = (minContribution + maxContribution) / 2;

      // Calculate future contributions with step-up for test amount
      let testFutureContributions = 0;
      let currentTestContrib = midContribution;

      for (let year = 1; year <= targetYears; year++) {
        const yearlyContribution = currentTestContrib * 12;
        const yearsRemaining = targetYears - year;
        const futureValueOfYearContribution = yearlyContribution *
          Math.pow(1 + expectedReturn / 100, yearsRemaining);

        testFutureContributions += futureValueOfYearContribution;

        // Apply step-up for next year only (no inflation on contributions)
        if (stepUpPercentage > 0 && year < targetYears) {
          currentTestContrib *= (1 + stepUpPercentage / 100);
        }
      }

      const testTotalAchieved = futureSavings + testFutureContributions;

      if (testTotalAchieved >= inflationAdjustedGoal) {
        maxContribution = midContribution;
        excessContribution = monthlyContribution - midContribution;
      } else {
        minContribution = midContribution;
      }
    }

    requiredMonthlyContribution = maxContribution;
  }

  return {
    futureSavings: Math.round(futureSavings),
    futureContributions: Math.round(futureContributions),
    totalAchieved: Math.round(totalAchieved),
    shortfall: Math.round(shortfall),
    requiredMonthlyContribution: Math.round(Math.max(requiredMonthlyContribution, 0)),
    excessContribution: Math.round(Math.max(excessContribution, 0)),
    goalMet,
    inflationAdjustedGoal: Math.round(inflationAdjustedGoal)
  };
};
