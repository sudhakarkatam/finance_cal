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

export const calculateStepUpSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  stepUpPercentage: number = 0
) => {
  const totalMonths = years * 12;
  const monthlyRate = expectedReturn / (12 * 100);

  let totalInvested = 0;
  let futureValue = 0;

  // Calculate month by month using the proper formula
  // FV = ∑ [P × (1 + ((1+R)^1/12 - 1))^(N – m)]
  for (let month = 0; month < totalMonths; month++) {
    // Calculate current monthly investment based on step-up
    // Step-up is applied at the beginning of each year
    const currentYear = Math.floor(month / 12);
    const currentMonthlyInvestment = monthlyInvestment * Math.pow(1 + stepUpPercentage / 100, currentYear);

    totalInvested += currentMonthlyInvestment;

    // Calculate future value for this month's investment
    // Using the formula: FV = P × (1 + r)^(N - m)
    // Where N is total months, m is current month (0-based)
    const monthsRemaining = totalMonths - month;
    const futureValueOfThisMonth = currentMonthlyInvestment * Math.pow(1 + monthlyRate, monthsRemaining);

    futureValue += futureValueOfThisMonth;
  }

  const returns = futureValue - totalInvested;

  return {
    invested: Math.round(totalInvested),
    returns: Math.round(returns),
    total: Math.round(futureValue)
  };
};

export const calculateStepUpSIPWithComparison = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  stepUpPercentage: number = 0
) => {
  // Calculate with step-up
  const stepUpResult = calculateStepUpSIP(monthlyInvestment, expectedReturn, years, stepUpPercentage);

  // Calculate without step-up for comparison
  const noStepUpResult = calculateSIP(monthlyInvestment, expectedReturn, years);

  // Calculate percentage difference
  const totalDifference = stepUpResult.total - noStepUpResult.total;
  const percentageDifference = noStepUpResult.total > 0 ? (totalDifference / noStepUpResult.total) * 100 : 0;

  return {
    withStepUp: stepUpResult,
    withoutStepUp: noStepUpResult,
    difference: Math.round(totalDifference),
    percentageDifference: Math.round(percentageDifference * 100) / 100 // Round to 2 decimal places
  };
};

export const calculateMutualFund = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number
) => {
  return calculateSIP(monthlyInvestment, expectedReturn, years);
};

export const calculateStepUpMutualFund = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  stepUpPercentage: number = 0
) => {
  return calculateStepUpSIP(monthlyInvestment, expectedReturn, years, stepUpPercentage);
};

export const calculateInflationAdjustedSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  inflationRate: number,
  stepUpPercentage: number = 0
) => {
  // Calculate with inflation-adjusted return rate
  const inflationAdjustedReturn = Math.max(0, expectedReturn - inflationRate);

  if (stepUpPercentage > 0) {
    return calculateStepUpSIP(monthlyInvestment, inflationAdjustedReturn, years, stepUpPercentage);
  } else {
    return calculateSIP(monthlyInvestment, inflationAdjustedReturn, years);
  }
};

export const calculateSWP = (
  investmentAmount: number,
  withdrawalPerMonth: number,
  expectedReturn: number,
  years?: number,
  inflationRate: number = 0,
  withdrawalStartsThisMonth: boolean = false
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

    let interestEarned: number;
    let endingBalance: number;

    if (withdrawalStartsThisMonth) {
      // Withdrawal first, then interest on remaining balance
      const balanceAfterWithdrawal = balance - withdrawalPerMonth;
      interestEarned = balanceAfterWithdrawal * monthlyRate;
      endingBalance = balanceAfterWithdrawal * (1 + monthlyRate);
    } else {
      // Interest first, then withdrawal (original logic)
      interestEarned = balance * monthlyRate;
      endingBalance = balance * (1 + monthlyRate) - withdrawalPerMonth;
    }

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
    amortizationData: amortizationData, // Full amortization data
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

export const calculateHRA = (
  basicSalary: number,
  dearnessAllowance: number,
  hraReceived: number,
  monthlyRent: number,
  isMetroCity: boolean
) => {
  // Calculate annual values
  const annualBasicSalary = basicSalary * 12;
  const annualDearnessAllowance = dearnessAllowance * 12;
  const annualHRAReceived = hraReceived * 12;
  const annualRent = monthlyRent * 12;

  // Salary for HRA calculation (basic + DA)
  const salaryForHRA = annualBasicSalary + annualDearnessAllowance;

  // 1. Actual HRA received from employer
  const actualHRA = annualHRAReceived;

  // 2. Actual rent paid minus 10% of basic salary
  const rentMinus10PercentBasic = annualRent - (annualBasicSalary * 0.1);

  // 3. 50% of salary for metro city, 40% for non-metro city
  const percentageOfSalary = isMetroCity ? 0.5 : 0.4;
  const metroNonMetroLimit = salaryForHRA * percentageOfSalary;

  // HRA exemption is the lowest of the three amounts
  const hraExemption = Math.min(actualHRA, rentMinus10PercentBasic, metroNonMetroLimit);

  // Taxable HRA
  const taxableHRA = Math.max(0, annualHRAReceived - hraExemption);

  return {
    annualBasicSalary: Math.round(annualBasicSalary),
    annualDearnessAllowance: Math.round(annualDearnessAllowance),
    annualHRAReceived: Math.round(annualHRAReceived),
    annualRent: Math.round(annualRent),
    salaryForHRA: Math.round(salaryForHRA),
    actualHRA: Math.round(actualHRA),
    rentMinus10PercentBasic: Math.round(rentMinus10PercentBasic),
    metroNonMetroLimit: Math.round(metroNonMetroLimit),
    hraExemption: Math.round(hraExemption),
    taxableHRA: Math.round(taxableHRA)
  };
};

export const calculateSSY = (
  annualInvestment: number,
  girlAge: number,
  investmentStartYear: number,
  currentInterestRate: number = 8.2,
  inflationRate: number = 0
) => {
  const investmentYears = 15;
  const totalMaturityYears = 21;
  const interestRate = currentInterestRate / 100;

  let totalInvested = 0;
  let futureValue = 0;

  // Calculate for each investment year
  for (let year = 1; year <= investmentYears; year++) {
    totalInvested += annualInvestment;

    // Each year's investment grows for (totalMaturityYears - year + 1) years
    // Year 1: grows for 21 years (deposited at start of year 1, matures end of year 21)
    // Year 2: grows for 20 years (deposited at start of year 2, matures end of year 21)
    // Year 15: grows for 7 years (deposited at start of year 15, matures end of year 21)
    const growthYears = totalMaturityYears - year + 1;

    // Using the compound interest formula: A = P × (1 + r)^t
    const futureValueOfYearInvestment = annualInvestment * Math.pow(1 + interestRate, growthYears);

    futureValue += futureValueOfYearInvestment;
  }

  const totalInterest = futureValue - totalInvested;
  const maturityYear = investmentStartYear + totalMaturityYears;

  // Calculate inflation-adjusted value
  const inflationAdjustedValue = inflationRate > 0
    ? futureValue / Math.pow(1 + inflationRate / 100, totalMaturityYears)
    : futureValue;

  return {
    totalInvested: Math.round(totalInvested),
    totalInterest: Math.round(totalInterest),
    maturityValue: Math.round(futureValue),
    inflationAdjustedValue: Math.round(inflationAdjustedValue),
    maturityYear,
    investmentYears,
    totalMaturityYears,
    interestRate: currentInterestRate,
    inflationRate
  };
};

export const calculateEPF = (
  basicSalary: number,
  currentBalance: number,
  employeeContributionPercent: number,
  currentAge: number,
  retirementAge: number,
  salaryGrowthPercent: number,
  interestRatePercent: number
) => {
  const yearsToRetirement = retirementAge - currentAge;
  if (yearsToRetirement <= 0) {
    return {
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalContributions: 0,
      totalInterest: 0,
      maturityValue: currentBalance,
      yearsToRetirement: 0
    };
  }

  const annualInterestRate = interestRatePercent / 100;
  const monthlyInterestRate = interestRatePercent / (12 * 100);
  const employerContributionPercent = 3.67; // 3.67% of basic salary goes to EPF (8.33% goes to EPS, not included)

  let balance = currentBalance;
  let totalEmployeeContribution = 0;
  let totalEmployerContribution = 0;
  let totalInterestAccrued = 0;
  let currentMonthlySalary = basicSalary;

  // EPF calculation: Interest calculated monthly on closing balance, compounds monthly
  // Even though interest is "credited annually" on statements, for calculation purposes
  // it compounds monthly to get accurate projections
  for (let year = 1; year <= yearsToRetirement; year++) {
    // Calculate monthly contribution for this year (constant throughout the year)
    const yearMonthlyEmployeeContribution = (employeeContributionPercent / 100) * currentMonthlySalary;
    const yearMonthlyEmployerContribution = (employerContributionPercent / 100) * currentMonthlySalary;
    const yearMonthlyContribution = yearMonthlyEmployeeContribution + yearMonthlyEmployerContribution;

    // Process each month: Add contributions, calculate interest on closing balance, compound monthly
    for (let month = 1; month <= 12; month++) {
      totalEmployeeContribution += yearMonthlyEmployeeContribution;
      totalEmployerContribution += yearMonthlyEmployerContribution;

      // Add contribution first to get closing balance
      balance += yearMonthlyContribution;
      
      // Calculate interest on closing balance (after adding contributions)
      // This is the method that matches SBI Securities calculator
      const monthlyInterest = balance * monthlyInterestRate;
      totalInterestAccrued += monthlyInterest;
      
      // Add interest immediately to balance for monthly compounding
      // This gives accurate projections even though it's credited annually on statements
      balance += monthlyInterest;
    }

    // Apply salary growth at the start of next year
    if (year < yearsToRetirement) {
      currentMonthlySalary *= (1 + salaryGrowthPercent / 100);
    }
  }

  return {
    totalEmployeeContribution: Math.round(totalEmployeeContribution),
    totalEmployerContribution: Math.round(totalEmployerContribution),
    totalContributions: Math.round(totalEmployeeContribution + totalEmployerContribution),
    totalInterest: Math.round(totalInterestAccrued),
    maturityValue: Math.round(balance),
    yearsToRetirement
  };
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
    const yearsRemaining = targetYears - year + 1;
    const futureValueOfYearContribution = yearlyContribution *
      Math.pow(1 + expectedReturn / 100, yearsRemaining);

    futureContributions += futureValueOfYearContribution;

    // Apply step-up for next year only (no inflation on contributions)
    // Step-up is applied at the END of each completed year
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
    const testContribution = monthlyContribution;
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
        const yearsRemaining = targetYears - year + 1;
        const futureValueOfYearContribution = yearlyContribution *
          Math.pow(1 + expectedReturn / 100, yearsRemaining);

        testFutureContributions += futureValueOfYearContribution;

        // Apply step-up for next year only (no inflation on contributions)
        // Step-up is applied at the END of each completed year
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
