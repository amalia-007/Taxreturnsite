'use strict';

// ATO 2023-24 tax brackets: [threshold, rate, base tax at threshold]
const BRACKETS = {
  australian: [
    [0,       0,      0],
    [18200,   0.19,   0],
    [45000,   0.325,  5092],
    [120000,  0.37,   29467],
    [180000,  0.45,   51667],
  ],
  whm: [
    [0,       0.15,   0],
    [45000,   0.325,  6750],
    [120000,  0.37,   31125],
    [180000,  0.45,   53325],
  ],
  foreign: [
    [0,       0.325,  0],
    [120000,  0.37,   39000],
    [180000,  0.45,   61200],
  ],
  nonresident: [
    [0,       0.325,  0],
    [120000,  0.37,   39000],
    [180000,  0.45,   61200],
  ],
};

function calculateTax(income, residentType) {
  const brackets = BRACKETS[residentType] || BRACKETS.australian;
  let tax = 0;
  for (let i = brackets.length - 1; i >= 0; i--) {
    const [threshold, rate, base] = brackets[i];
    if (income > threshold) {
      tax = base + (income - threshold) * rate;
      break;
    }
  }
  return Math.max(0, tax);
}

function calculateLITO(income) {
  if (income <= 37500)  return 700;
  if (income <= 45000)  return Math.max(0, 700  - (income - 37500)  * 0.05);
  if (income <= 66667)  return Math.max(0, 325  - (income - 45000)  * 0.015);
  return 0;
}

// 2023-24 low-income Medicare threshold: $24,276; shade-in: 10% above threshold
const MEDICARE_THRESHOLD    = 24276;
const MEDICARE_FULL_RATE    = 0.02;
const MEDICARE_SHADE_RATE   = 0.10;
const MEDICARE_FULL_START   = Math.round(MEDICARE_THRESHOLD / (1 - MEDICARE_FULL_RATE / MEDICARE_SHADE_RATE));

// MLS tiers: [min income, surcharge rate]
const MLS_TIERS = [
  [144001, 0.015],
  [108001, 0.0125],
  [93001,  0.01],
];

function calculateMedicare(income, hasPrivateCover) {
  let levy = 0;
  if (income <= MEDICARE_THRESHOLD) {
    levy = 0;
  } else if (income < MEDICARE_FULL_START) {
    levy = (income - MEDICARE_THRESHOLD) * MEDICARE_SHADE_RATE;
  } else {
    levy = income * MEDICARE_FULL_RATE;
  }

  let surcharge = 0;
  if (!hasPrivateCover) {
    for (const [min, rate] of MLS_TIERS) {
      if (income >= min) { surcharge = income * rate; break; }
    }
  }

  return { levy: Math.round(levy), surcharge: Math.round(surcharge) };
}

// 2023-24 HECS-HELP repayment thresholds: [min income, rate]
const HECS_THRESHOLDS = [
  [151201, 0.100],
  [142642, 0.095],
  [134572, 0.090],
  [126951, 0.085],
  [119765, 0.080],
  [112985, 0.075],
  [106591, 0.070],
  [100558, 0.065],
  [94865,  0.060],
  [89495,  0.055],
  [84430,  0.050],
  [79650,  0.045],
  [75141,  0.040],
  [70889,  0.035],
  [66876,  0.030],
  [63090,  0.025],
  [59519,  0.020],
  [51550,  0.010],
];

function calculateHECS(income) {
  for (const [min, rate] of HECS_THRESHOLDS) {
    if (income >= min) return Math.round(income * rate);
  }
  return 0;
}
