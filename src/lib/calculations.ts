import {
  NEW_REGIME_SLABS,
  OLD_REGIME_SLABS,
  SENIOR_CITIZEN_EXEMPTION,
  STANDARD_DEDUCTION,
  REBATE_87A,
  DEDUCTION_LIMITS,
  SURCHARGE_RATES,
  CESS_RATE,
  CAPITAL_GAINS_EXEMPTION,
  type AgeCategory,
  type TaxRegime,
} from "./taxConstants";

export const calculateSimpleInterest = (
  principal: number,
  rate: number,
  time: number,
) => {
  const interest = (principal * rate * time) / 100;
  const total = principal + interest;
  return {
    interest: Math.round(interest),
    total: Math.round(total),
    principal: Math.round(principal),
  };
};

export const calculateCompoundInterest = (
  principal: number,
  rate: number,
  time: number,
  frequency: number = 1,
) => {
  const amount =
    principal * Math.pow(1 + rate / (100 * frequency), frequency * time);
  const interest = amount - principal;
  return {
    interest: Math.round(interest),
    total: Math.round(amount),
    principal: Math.round(principal),
  };
};

/**
 * Calculate compound interest when interest is specified as percentage per month
 * @param principal - Principal amount
 * @param percentPerMonth - Interest rate in percentage per month (e.g., 2 = 2% per month = 24% per annum)
 * @param time - Time period in years
 * @param frequency - Compounding frequency per year (1=yearly, 2=half-yearly, 4=quarterly, 12=monthly, etc.)
 * @returns Compound interest calculation result
 */
export const calculateCompoundInterestFromMonthlyRupees = (
  principal: number,
  percentPerMonth: number,
  time: number,
  frequency: number = 12, // Default to monthly compounding for monthly percentage input
) => {
  if (principal <= 0) {
    return {
      interest: 0,
      total: principal,
      principal: Math.round(principal),
    };
  }

  // Convert monthly rate to annual rate
  // Annual rate = Monthly rate * 12 (e.g., 2% per month = 24% per annum)
  const annualRate = percentPerMonth * 12;

  // Use standard compound interest formula with the annual rate
  // This ensures the calculation matches what the equivalent annual rate would give
  // Formula: A = P * (1 + annualRate/(100 * frequency))^(frequency * time)
  const amount =
    principal * Math.pow(1 + annualRate / (100 * frequency), frequency * time);
  const interest = amount - principal;

  return {
    interest: Math.round(interest),
    total: Math.round(amount),
    principal: Math.round(principal),
  };
};

/**
 * Calculate compound interest with monthly percentage rate for date-based calculations
 * Handles custom days and respects compounding frequency
 * @param principal - Principal amount
 * @param percentPerMonth - Interest rate in percentage per month (e.g., 2 = 2% per month = 24% per annum)
 * @param days - Number of days
 * @param frequency - Compounding frequency per year (1=yearly, 2=half-yearly, 4=quarterly, 12=monthly, etc.)
 * @returns Compound interest calculation result
 */
// Helper function to convert date range to years, months, days
const dateRangeToYMD = (start: Date, end: Date) => {
  let years = end.getFullYear() - start.getFullYear();
  let months = end.getMonth() - start.getMonth();
  let days = end.getDate() - start.getDate();

  // Adjust for negative days
  if (days < 0) {
    months--;
    const lastDayOfPrevMonth = new Date(end.getFullYear(), end.getMonth(), 0);
    days += lastDayOfPrevMonth.getDate();
  }

  // Adjust for negative months
  if (months < 0) {
    years--;
    months += 12;
  }

  return { years, months, days };
};

export const calculateCompoundInterestFromMonthlyRupeesWithDays = (
  principal: number,
  percentPerMonth: number,
  days: number,
  frequency: number = 12, // Default to monthly compounding
  startDate?: Date,
  endDate?: Date,
) => {
  if (principal <= 0 || days <= 0) {
    return {
      interest: 0,
      total: principal,
      principal: Math.round(principal),
    };
  }

  // Convert monthly rate to annual rate FIRST (needed for all calculations)
  // Annual rate = Monthly rate * 12 (e.g., 2% per month = 24% per annum)
  const annualRate = percentPerMonth * 12;

  // If we have actual dates, use actual days calculation for yearly compounding
  // For other frequencies, convert to YMD for consistency
  let timeInYears: number;

  if (startDate && endDate) {
    // Convert date range to years/months/days, then use same logic as manual input
    // This ensures consistency between manual and date-based inputs
    const dateRangeToYMD = (start: Date, end: Date) => {
      let years = end.getFullYear() - start.getFullYear();
      let months = end.getMonth() - start.getMonth();
      let days = end.getDate() - start.getDate();

      if (days < 0) {
        months--;
        const lastDayOfPrevMonth = new Date(
          end.getFullYear(),
          end.getMonth(),
          0,
        );
        days += lastDayOfPrevMonth.getDate();
      }

      if (months < 0) {
        years--;
        months += 12;
      }

      return { years, months, days };
    };

    const {
      years,
      months,
      days: dayCount,
    } = dateRangeToYMD(startDate, endDate);

    // Vaddi Calculator Method: Use 360 days/year, 30 days/month convention
    // This matches Indian rural lending practices (https://interest-calculator.anreddy.in)
    // For yearly compounding: Use Hybrid Method (Compound for years, Simple for fractional)
    // For other frequencies: Use pure compound with 360/30 convention

    if (frequency === 1) {
      // Yearly compounding: Hybrid Method (matches Vaddi Calculator output exactly)
      // Compound interest for complete years, Simple interest for fractional period using 360/30

      if (years > 0) {
        // Step 1: Calculate compound interest for whole years
        const amountAfterYears =
          principal * Math.pow(1 + annualRate / 100, years);

        // Step 2: Calculate simple interest for fractional period using 360/30 convention
        const fractionalDays = months * 30 + dayCount;
        const fractionalTime = fractionalDays / 360; // Use 360/30 convention
        const simpleInterest =
          amountAfterYears * (annualRate / 100) * fractionalTime;
        const finalAmount = amountAfterYears + simpleInterest;

        return {
          interest: Math.round(finalAmount - principal),
          total: Math.round(finalAmount),
          principal: Math.round(principal),
        };
      } else {
        // For periods less than 1 year, use simple interest only with 360/30 convention
        const fractionalDays = months * 30 + dayCount;
        const fractionalTime = fractionalDays / 360;
        const simpleInterest = principal * (annualRate / 100) * fractionalTime;
        const finalAmount = principal + simpleInterest;

        return {
          interest: Math.round(simpleInterest),
          total: Math.round(finalAmount),
          principal: Math.round(principal),
        };
      }
    } else if (frequency === 12) {
      // Monthly compounding: use 360/30 convention (pure compound)
      const totalDays = years * 360 + months * 30 + dayCount;
      timeInYears = totalDays / 360;
    } else if (frequency === 4) {
      // Quarterly compounding: use 360/30 convention (pure compound)
      const totalDays = years * 360 + months * 30 + dayCount;
      timeInYears = totalDays / 360;
    } else {
      // Other frequencies: use 360/30 convention (pure compound)
      const totalDays = years * 360 + months * 30 + dayCount;
      timeInYears = totalDays / 360;
    }
  } else {
    // Fallback to days-based calculation if dates not available
    // Vaddi Calculator Method: Always use 360/30 convention
    // For fallback with just days, assume 360 days/year
    if (frequency === 12) {
      // Monthly: use 360 days/year
      timeInYears = days / 360;
    } else if (frequency === 4) {
      // Quarterly: use 360 days/year
      timeInYears = days / 360;
    } else if (frequency === 1) {
      // Yearly: use 360 days/year
      timeInYears = days / 360;
    } else {
      // Other frequencies: use 360 days/year
      timeInYears = days / 360;
    }
  }

  // Use standard compound interest formula with the annual rate and selected frequency
  // This ensures the calculation matches what the equivalent annual rate would give
  // Formula: A = P * (1 + annualRate/(100 * frequency))^(frequency * time)
  const amount =
    principal *
    Math.pow(1 + annualRate / (100 * frequency), frequency * timeInYears);
  const interest = amount - principal;

  return {
    interest: Math.round(interest),
    total: Math.round(amount),
    principal: Math.round(principal),
  };
};

export const calculateSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
) => {
  const months = years * 12;
  const monthlyRate = expectedReturn / (12 * 100);

  // Handle edge cases
  if (monthlyRate === 0 || months === 0) {
    const invested = monthlyInvestment * months;
    return {
      invested: Math.round(invested),
      returns: 0,
      total: Math.round(invested),
    };
  }

  // Standard SIP formula: FV = P * (((1 + r)^n - 1) / r) * (1 + r)
  const futureValue =
    monthlyInvestment *
    ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
    (1 + monthlyRate);

  const invested = monthlyInvestment * months;
  const returns = futureValue - invested;

  return {
    invested: Math.round(invested),
    returns: Math.round(returns),
    total: Math.round(futureValue),
  };
};

export const calculateStepUpSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  stepUpPercentage: number = 0,
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
    const currentMonthlyInvestment =
      monthlyInvestment * Math.pow(1 + stepUpPercentage / 100, currentYear);

    totalInvested += currentMonthlyInvestment;

    // Calculate future value for this month's investment
    // Using the formula: FV = P × (1 + r)^(N - m)
    // Where N is total months, m is current month (0-based)
    const monthsRemaining = totalMonths - month;
    const futureValueOfThisMonth =
      currentMonthlyInvestment * Math.pow(1 + monthlyRate, monthsRemaining);

    futureValue += futureValueOfThisMonth;
  }

  const returns = futureValue - totalInvested;

  return {
    invested: Math.round(totalInvested),
    returns: Math.round(returns),
    total: Math.round(futureValue),
  };
};

export const calculateStepUpSIPWithComparison = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  stepUpPercentage: number = 0,
) => {
  // Calculate with step-up
  const stepUpResult = calculateStepUpSIP(
    monthlyInvestment,
    expectedReturn,
    years,
    stepUpPercentage,
  );

  // Calculate without step-up for comparison
  const noStepUpResult = calculateSIP(monthlyInvestment, expectedReturn, years);

  // Calculate percentage difference
  const totalDifference = stepUpResult.total - noStepUpResult.total;
  const percentageDifference =
    noStepUpResult.total > 0
      ? (totalDifference / noStepUpResult.total) * 100
      : 0;

  return {
    withStepUp: stepUpResult,
    withoutStepUp: noStepUpResult,
    difference: Math.round(totalDifference),
    percentageDifference: Math.round(percentageDifference * 100) / 100, // Round to 2 decimal places
  };
};

export const calculateMutualFund = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
) => {
  return calculateSIP(monthlyInvestment, expectedReturn, years);
};

export const calculateStepUpMutualFund = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  stepUpPercentage: number = 0,
) => {
  return calculateStepUpSIP(
    monthlyInvestment,
    expectedReturn,
    years,
    stepUpPercentage,
  );
};

export const calculateInflationAdjustedSIP = (
  monthlyInvestment: number,
  expectedReturn: number,
  years: number,
  inflationRate: number,
  stepUpPercentage: number = 0,
) => {
  // Calculate with inflation-adjusted return rate
  // Handle edge case where inflation might be higher than return
  const inflationAdjustedReturn = expectedReturn - inflationRate;

  // If inflation-adjusted return is negative or zero, use minimal positive value
  const safeReturn =
    inflationAdjustedReturn <= 0 ? 0.01 : inflationAdjustedReturn;

  if (stepUpPercentage > 0) {
    return calculateStepUpSIP(
      monthlyInvestment,
      safeReturn,
      years,
      stepUpPercentage,
    );
  } else {
    return calculateSIP(monthlyInvestment, safeReturn, years);
  }
};

export const calculateSWP = (
  investmentAmount: number,
  withdrawalPerMonth: number,
  expectedReturn: number,
  years?: number,
  inflationRate: number = 0,
  withdrawalStartsThisMonth: boolean = false,
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
      endingBalance: Math.round(endingBalance),
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
  const inflationAdjustedFinalValue =
    years && inflationRate > 0
      ? balance / Math.pow(1 + inflationRate / 100, years)
      : balance;

  // Calculate sustainable withdrawal if period is given
  let sustainableWithdrawal = 0;
  if (years) {
    const monthsInPeriod = years * 12;
    if (monthlyRate > 0) {
      // PMT formula for loan payment (rearranged for withdrawal)
      sustainableWithdrawal =
        (investmentAmount *
          monthlyRate *
          Math.pow(1 + monthlyRate, monthsInPeriod)) /
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
    fullAmortizationData: amortizationData,
  };
};

export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(amount);
};

export const formatNumber = (num: number): string => {
  return new Intl.NumberFormat("en-IN").format(Math.round(num));
};

export const calculateHRA = (
  basicSalary: number,
  dearnessAllowance: number,
  hraReceived: number,
  monthlyRent: number,
  isMetroCity: boolean,
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
  const rentMinus10PercentBasic = annualRent - annualBasicSalary * 0.1;

  // 3. 50% of salary for metro city, 40% for non-metro city
  const percentageOfSalary = isMetroCity ? 0.5 : 0.4;
  const metroNonMetroLimit = salaryForHRA * percentageOfSalary;

  // HRA exemption is the lowest of the three amounts
  const hraExemption = Math.min(
    actualHRA,
    rentMinus10PercentBasic,
    metroNonMetroLimit,
  );

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
    taxableHRA: Math.round(taxableHRA),
  };
};

export const calculateSSY = (
  annualInvestment: number,
  girlAge: number,
  investmentStartYear: number,
  currentInterestRate: number = 8.2,
  inflationRate: number = 0,
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
    const futureValueOfYearInvestment =
      annualInvestment * Math.pow(1 + interestRate, growthYears);

    futureValue += futureValueOfYearInvestment;
  }

  const totalInterest = futureValue - totalInvested;
  const maturityYear = investmentStartYear + totalMaturityYears;

  // Calculate inflation-adjusted value
  const inflationAdjustedValue =
    inflationRate > 0
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
    inflationRate,
  };
};

export const calculateEPF = (
  basicSalary: number,
  currentBalance: number,
  employeeContributionPercent: number,
  currentAge: number,
  retirementAge: number,
  salaryGrowthPercent: number,
  interestRatePercent: number,
) => {
  const yearsToRetirement = retirementAge - currentAge;
  if (yearsToRetirement <= 0) {
    return {
      totalEmployeeContribution: 0,
      totalEmployerContribution: 0,
      totalContributions: 0,
      totalInterest: 0,
      maturityValue: currentBalance,
      yearsToRetirement: 0,
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
    const yearMonthlyEmployeeContribution =
      (employeeContributionPercent / 100) * currentMonthlySalary;
    const yearMonthlyEmployerContribution =
      (employerContributionPercent / 100) * currentMonthlySalary;
    const yearMonthlyContribution =
      yearMonthlyEmployeeContribution + yearMonthlyEmployerContribution;

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
      currentMonthlySalary *= 1 + salaryGrowthPercent / 100;
    }
  }

  return {
    totalEmployeeContribution: Math.round(totalEmployeeContribution),
    totalEmployerContribution: Math.round(totalEmployerContribution),
    totalContributions: Math.round(
      totalEmployeeContribution + totalEmployerContribution,
    ),
    totalInterest: Math.round(totalInterestAccrued),
    maturityValue: Math.round(balance),
    yearsToRetirement,
  };
};

export const calculateGoalPlanning = (
  goalAmount: number,
  targetYears: number,
  currentSavings: number,
  monthlyContribution: number,
  expectedReturn: number,
  inflationRate: number = 0,
  stepUpPercentage: number = 0,
) => {
  const months = targetYears * 12;
  const monthlyRate = expectedReturn / (12 * 100);

  // Adjust goal amount for inflation if enabled
  const inflationAdjustedGoal =
    inflationRate > 0
      ? goalAmount * Math.pow(1 + inflationRate / 100, targetYears)
      : goalAmount;

  // Calculate future value of current savings
  const futureSavings =
    currentSavings * Math.pow(1 + expectedReturn / 100, targetYears);

  // Calculate future value of monthly contributions with step-up only
  let futureContributions = 0;
  let currentMonthlyContrib = monthlyContribution;

  for (let year = 1; year <= targetYears; year++) {
    const yearlyContribution = currentMonthlyContrib * 12;

    // Future value of this year's contributions
    const yearsRemaining = targetYears - year + 1;
    const futureValueOfYearContribution =
      yearlyContribution * Math.pow(1 + expectedReturn / 100, yearsRemaining);

    futureContributions += futureValueOfYearContribution;

    // Apply step-up for next year only (no inflation on contributions)
    // Step-up is applied at the END of each completed year
    if (stepUpPercentage > 0 && year < targetYears) {
      currentMonthlyContrib *= 1 + stepUpPercentage / 100;
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
    const futureValueFactor =
      (Math.pow(1 + monthlyRate, months) - 1) / monthlyRate;

    // Account for current savings growth
    const futureSavingsValue =
      currentSavings * Math.pow(1 + expectedReturn / 100, targetYears);

    // Calculate remaining amount needed after current savings grow
    const remainingGoal = Math.max(
      0,
      inflationAdjustedGoal - futureSavingsValue,
    );

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
      excessContribution =
        excessCorpus /
        (Math.pow(1 + averageMonthlyRate, targetYears) - 1) /
        averageMonthlyRate /
        12;
    }

    // More precise calculation for excess contribution
    const testContribution = monthlyContribution;
    let minContribution = 0;
    let maxContribution = monthlyContribution;

    // Binary search to find the minimum contribution needed
    for (let i = 0; i < 20; i++) {
      // Max 20 iterations for precision
      const midContribution = (minContribution + maxContribution) / 2;

      // Calculate future contributions with step-up for test amount
      let testFutureContributions = 0;
      let currentTestContrib = midContribution;

      for (let year = 1; year <= targetYears; year++) {
        const yearlyContribution = currentTestContrib * 12;
        const yearsRemaining = targetYears - year + 1;
        const futureValueOfYearContribution =
          yearlyContribution *
          Math.pow(1 + expectedReturn / 100, yearsRemaining);

        testFutureContributions += futureValueOfYearContribution;

        // Apply step-up for next year only (no inflation on contributions)
        // Step-up is applied at the END of each completed year
        if (stepUpPercentage > 0 && year < targetYears) {
          currentTestContrib *= 1 + stepUpPercentage / 100;
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
    requiredMonthlyContribution: Math.round(
      Math.max(requiredMonthlyContribution, 0),
    ),
    excessContribution: Math.round(Math.max(excessContribution, 0)),
    goalMet,
    inflationAdjustedGoal: Math.round(inflationAdjustedGoal),
  };
};

// Income Tax Calculation for FY 2025-26

interface IncomeTaxInputs {
  financialYear: "2025-26" | "2024-25" | "2023-24";
  ageCategory: AgeCategory;
  taxRegime: TaxRegime;
  grossSalary: number;
  exemptAllowances: number;
  interestIncome: number;
  rentalIncome: number;
  homeLoanInterestSelfOccupied: number;
  homeLoanInterestLetOut: number;
  capitalGains: number;
  capitalGainsType: "STCG" | "LTCG";
  capitalGainsAssetType: "equity" | "property" | "debt" | "other";
  cryptoIncome: number;
  section80C: number;
  section80CCD1B: number;
  section80D: number;
  section80DAdditional: number;
  section80G: number;
  section80E: number;
  section80TTA: number;
  section80EE: number;
  section80EEA: number;
  section80U: number;
}

interface IncomeTaxResult {
  grossTotalIncome: number;
  taxableIncomeNew: number;
  taxableIncomeOld: number;
  totalDeductionsNew: number;
  totalDeductionsOld: number;
  taxNew: number;
  taxOld: number;
  rebateNew: number;
  rebateOld: number;
  surchargeNew: number;
  surchargeOld: number;
  cessNew: number;
  cessOld: number;
  totalTaxNew: number;
  totalTaxOld: number;
  recommendation: "new" | "old";
  taxSavings: number;
  breakdown: {
    salaryIncome: number;
    housePropertyIncome: number;
    capitalGainsIncome: number;
    otherIncome: number;
  };
}

export const calculateIncomeTax = (
  inputs: IncomeTaxInputs,
): IncomeTaxResult => {
  // 1. Calculate Gross Total Income
  const salaryIncome = inputs.grossSalary - inputs.exemptAllowances;
  const housePropertyIncome = Math.max(
    0,
    inputs.rentalIncome -
      inputs.rentalIncome * 0.3 -
      inputs.homeLoanInterestLetOut,
  );
  const otherIncome = inputs.interestIncome + inputs.cryptoIncome;

  // Capital gains calculation
  let capitalGainsIncome = inputs.capitalGains;
  if (
    inputs.capitalGainsType === "LTCG" &&
    inputs.capitalGainsAssetType === "equity"
  ) {
    const exemption =
      inputs.financialYear === "2025-26"
        ? CAPITAL_GAINS_EXEMPTION.equityLTCG_FY2025
        : CAPITAL_GAINS_EXEMPTION.equityLTCG;
    capitalGainsIncome = Math.max(0, inputs.capitalGains - exemption);
  }

  const grossTotalIncome =
    salaryIncome + housePropertyIncome + capitalGainsIncome + otherIncome;

  // 2. Calculate Deductions
  // New Regime: Only standard deduction, 80CCD(1B), 80D
  const stdDeductionNew = inputs.grossSalary > 0 ? STANDARD_DEDUCTION.new : 0;
  const section80CCD1BNew = Math.min(
    inputs.section80CCD1B,
    DEDUCTION_LIMITS.section80CCD1B,
  );
  const section80DNew = Math.min(
    inputs.section80D,
    DEDUCTION_LIMITS.section80D.self,
  );
  const totalDeductionsNew =
    stdDeductionNew + section80CCD1BNew + section80DNew;

  // Old Regime: All deductions
  const stdDeductionOld = inputs.grossSalary > 0 ? STANDARD_DEDUCTION.old : 0;
  const section80COld = Math.min(
    inputs.section80C,
    DEDUCTION_LIMITS.section80C,
  );
  const section80CCD1BOld = Math.min(
    inputs.section80CCD1B,
    DEDUCTION_LIMITS.section80CCD1B,
  );
  const section80DOld = Math.min(
    inputs.section80D,
    DEDUCTION_LIMITS.section80D.self,
  );
  const section80DAdditionalOld = Math.min(
    inputs.section80DAdditional,
    DEDUCTION_LIMITS.section80D.parents,
  );
  const section80GOld = inputs.section80G; // No limit, varies by organization
  const section80EOld = inputs.section80E; // No limit
  const section80TTAOld = Math.min(
    inputs.interestIncome,
    inputs.section80TTA || DEDUCTION_LIMITS.section80TTA,
  );
  const section80EEOld = Math.min(
    inputs.section80EE,
    DEDUCTION_LIMITS.section80EE,
  );
  const section80EEAOld = Math.min(
    inputs.section80EEA,
    DEDUCTION_LIMITS.section80EEA,
  );
  const section80UOld =
    inputs.section80U > 0 ? DEDUCTION_LIMITS.section80U.disability : 0; // Simplified
  const section24bOld = Math.min(
    inputs.homeLoanInterestSelfOccupied,
    DEDUCTION_LIMITS.section24b,
  );

  const totalDeductionsOld =
    stdDeductionOld +
    section80COld +
    section80CCD1BOld +
    section80DOld +
    section80DAdditionalOld +
    section80GOld +
    section80EOld +
    section80TTAOld +
    section80EEOld +
    section80EEAOld +
    section80UOld +
    section24bOld;

  // 3. Calculate Taxable Income
  const taxableIncomeNew = Math.max(0, grossTotalIncome - totalDeductionsNew);
  let taxableIncomeOld = Math.max(0, grossTotalIncome - totalDeductionsOld);

  // Apply senior citizen exemption (Old Regime only)
  const exemptionLimit = SENIOR_CITIZEN_EXEMPTION[inputs.ageCategory];
  if (exemptionLimit > SENIOR_CITIZEN_EXEMPTION.below60) {
    taxableIncomeOld = Math.max(
      0,
      taxableIncomeOld - (exemptionLimit - SENIOR_CITIZEN_EXEMPTION.below60),
    );
  }

  // 4. Calculate Tax (before rebate)
  const taxNew = calculateTaxFromSlabs(taxableIncomeNew, NEW_REGIME_SLABS);
  const taxOld = calculateTaxFromSlabs(taxableIncomeOld, OLD_REGIME_SLABS);

  // 5. Apply Section 87A Rebate
  const rebateNew =
    taxableIncomeNew <= REBATE_87A.new.maxTaxableIncome
      ? Math.min(taxNew, REBATE_87A.new.rebateAmount)
      : 0;
  const rebateOld =
    taxableIncomeOld <= REBATE_87A.old.maxTaxableIncome
      ? Math.min(taxOld, REBATE_87A.old.rebateAmount)
      : 0;

  const taxAfterRebateNew = Math.max(0, taxNew - rebateNew);
  const taxAfterRebateOld = Math.max(0, taxOld - rebateOld);

  // 6. Add Surcharge
  const surchargeNew = calculateSurcharge(taxAfterRebateNew, taxableIncomeNew);
  const surchargeOld = calculateSurcharge(taxAfterRebateOld, taxableIncomeOld);

  const taxAfterSurchargeNew = taxAfterRebateNew + surchargeNew;
  const taxAfterSurchargeOld = taxAfterRebateOld + surchargeOld;

  // 7. Add Cess (4%)
  const cessNew = Math.round((taxAfterSurchargeNew * CESS_RATE) / 100);
  const cessOld = Math.round((taxAfterSurchargeOld * CESS_RATE) / 100);

  const totalTaxNew = Math.round(taxAfterSurchargeNew + cessNew);
  const totalTaxOld = Math.round(taxAfterSurchargeOld + cessOld);

  // 8. Determine Recommendation
  const recommendation = totalTaxNew <= totalTaxOld ? "new" : "old";
  const taxSavings = Math.abs(totalTaxNew - totalTaxOld);

  return {
    grossTotalIncome: Math.round(grossTotalIncome),
    taxableIncomeNew: Math.round(taxableIncomeNew),
    taxableIncomeOld: Math.round(taxableIncomeOld),
    totalDeductionsNew: Math.round(totalDeductionsNew),
    totalDeductionsOld: Math.round(totalDeductionsOld),
    taxNew: Math.round(taxNew),
    taxOld: Math.round(taxOld),
    rebateNew: Math.round(rebateNew),
    rebateOld: Math.round(rebateOld),
    surchargeNew: Math.round(surchargeNew),
    surchargeOld: Math.round(surchargeOld),
    cessNew,
    cessOld,
    totalTaxNew,
    totalTaxOld,
    recommendation,
    taxSavings: Math.round(taxSavings),
    breakdown: {
      salaryIncome: Math.round(salaryIncome),
      housePropertyIncome: Math.round(housePropertyIncome),
      capitalGainsIncome: Math.round(capitalGainsIncome),
      otherIncome: Math.round(otherIncome),
    },
  };
};

// Percentage Calculator
export const calculatePercentage = (number: number, percentage: number) => {
  // What is X% of Y?
  const result = (number * percentage) / 100;
  return {
    number,
    percentage,
    result: Math.round(result * 100) / 100,
  };
};

export const findPercentage = (part: number, whole: number) => {
  // X is what % of Y?
  if (whole === 0) return { part, whole, percentage: 0 };
  const percentage = (part / whole) * 100;
  return {
    part,
    whole,
    percentage: Math.round(percentage * 100) / 100,
  };
};

export const percentageChange = (originalValue: number, newValue: number) => {
  // % increase/decrease from X to Y
  if (originalValue === 0) {
    return {
      originalValue,
      newValue,
      change: newValue,
      percentageChange: 0,
      isIncrease: newValue > 0,
    };
  }

  const change = newValue - originalValue;
  const percentageChange = (change / originalValue) * 100;
  const isIncrease = change > 0;

  return {
    originalValue,
    newValue,
    change: Math.round(change * 100) / 100,
    percentageChange: Math.round(percentageChange * 100) / 100,
    isIncrease,
  };
};

export const addPercentage = (
  number: number,
  percentage: number,
  operation: "add" | "subtract",
) => {
  // Add or subtract X% to/from Y
  const percentageAmount = (number * percentage) / 100;
  const result =
    operation === "add" ? number + percentageAmount : number - percentageAmount;

  return {
    number,
    percentage,
    operation,
    percentageAmount: Math.round(percentageAmount * 100) / 100,
    result: Math.round(result * 100) / 100,
  };
};

export const percentageDifference = (value1: number, value2: number) => {
  // What's the % difference between X and Y?
  const difference = Math.abs(value2 - value1);
  const average = (value1 + value2) / 2;

  if (average === 0) {
    return {
      value1,
      value2,
      difference,
      percentageDifference: 0,
    };
  }

  const percentageDiff = (difference / average) * 100;

  return {
    value1,
    value2,
    difference: Math.round(difference * 100) / 100,
    percentageDifference: Math.round(percentageDiff * 100) / 100,
  };
};

// Helper function to calculate tax from slabs
const calculateTaxFromSlabs = (
  taxableIncome: number,
  slabs: Array<{ min: number; max: number; rate: number }>,
): number => {
  let tax = 0;
  let remaining = taxableIncome;

  for (const slab of slabs) {
    if (remaining <= 0) break;

    const slabAmount = Math.min(
      remaining,
      slab.max === Infinity ? remaining : slab.max - slab.min,
    );
    tax += (slabAmount * slab.rate) / 100;
    remaining -= slabAmount;
  }

  return tax;
};

// Helper function to calculate surcharge
const calculateSurcharge = (tax: number, taxableIncome: number): number => {
  for (const surchargeRate of SURCHARGE_RATES) {
    if (
      taxableIncome >= surchargeRate.min &&
      taxableIncome < surchargeRate.max
    ) {
      return (tax * surchargeRate.rate) / 100;
    }
  }
  return 0;
};

// Inflation Calculator
export const calculateInflation = (
  currentPrice: number,
  inflationRate: number,
  years: number,
) => {
  const futurePrice = currentPrice * Math.pow(1 + inflationRate / 100, years);
  const totalInflation = futurePrice - currentPrice;
  const inflationPercentage = ((futurePrice - currentPrice) / currentPrice) * 100;

  return {
    currentPrice: Math.round(currentPrice),
    futurePrice: Math.round(futurePrice),
    totalInflation: Math.round(totalInflation),
    inflationPercentage: Math.round(inflationPercentage * 100) / 100,
    inflationRate,
    years,
  };
};

export const calculatePresentValue = (
  futurePrice: number,
  inflationRate: number,
  years: number,
) => {
  const presentValue = futurePrice / Math.pow(1 + inflationRate / 100, years);
  const totalInflation = futurePrice - presentValue;

  return {
    futurePrice: Math.round(futurePrice),
    presentValue: Math.round(presentValue),
    totalInflation: Math.round(totalInflation),
    inflationRate,
    years,
  };
};

// GST Calculator
export const calculateGST = (
  amount: number,
  gstRate: number,
  isInclusive: boolean,
) => {
  let originalAmount: number;
  let gstAmount: number;
  let totalAmount: number;

  if (isInclusive) {
    totalAmount = amount;
    originalAmount = amount / (1 + gstRate / 100);
    gstAmount = amount - originalAmount;
  } else {
    originalAmount = amount;
    gstAmount = (amount * gstRate) / 100;
    totalAmount = amount + gstAmount;
  }

  const cgst = gstAmount / 2;
  const sgst = gstAmount / 2;

  return {
    originalAmount: Math.round(originalAmount * 100) / 100,
    gstAmount: Math.round(gstAmount * 100) / 100,
    cgst: Math.round(cgst * 100) / 100,
    sgst: Math.round(sgst * 100) / 100,
    igst: Math.round(gstAmount * 100) / 100,
    totalAmount: Math.round(totalAmount * 100) / 100,
    gstRate,
    isInclusive,
  };
};
