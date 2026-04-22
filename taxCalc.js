'use strict';

// ── 2024-25 ATO Tax Rates (Stage 3 cuts, effective 1 July 2024) ─────────────
// Sources:
//   Residents:   ato.gov.au/tax-rates-and-codes/tax-rates-australian-residents
//   Foreign:     ato.gov.au/tax-rates-and-codes/tax-rates-foreign-residents
//   WHM:         ato.gov.au/tax-rates-and-codes/tax-rates-working-holiday-makers
//   LITO:        ato.gov.au/individuals-and-families/.../low-income-tax-offset
//   Medicare:    ato.gov.au/.../medicare-levy-reduction-for-low-income-earners
//   HECS:        ato.gov.au/tax-rates-and-codes/study-and-training-support-loans-...
//
// Bracket format: [income_threshold, marginal_rate, cumulative_base_tax]
// cumulative_base_tax = total tax payable AT the threshold (not above it)

const BRACKETS = {
  australian: [
    [0,       0,     0      ],
    [18200,   0.16,  0      ],  // 16c per $1 over $18,200
    [45000,   0.30,  4288   ],  // $4,288 + 30c per $1 over $45,000
    [135000,  0.37,  31288  ],  // $31,288 + 37c per $1 over $135,000
    [190000,  0.45,  51638  ],  // $51,638 + 45c per $1 over $190,000
  ],
  foreign: [
    [0,       0.30,  0      ],  // 30c per $1 (no tax-free threshold)
    [135000,  0.37,  40500  ],  // $40,500 + 37c per $1 over $135,000
    [190000,  0.45,  60850  ],  // $60,850 + 45c per $1 over $190,000
  ],
  whm: [
    [0,       0.15,  0      ],  // 15c per $1 (first $45,000)
    [45000,   0.30,  6750   ],  // $6,750 + 30c per $1 over $45,000
    [135000,  0.37,  33750  ],  // $33,750 + 37c per $1 over $135,000
    [190000,  0.45,  54100  ],  // $54,100 + 45c per $1 over $190,000
  ],
  // Alias kept for backward compatibility with index.html
  nonresident: [
    [0,       0.30,  0      ],
    [135000,  0.37,  40500  ],
    [190000,  0.45,  60850  ],
  ],
};

// ── Income Tax ───────────────────────────────────────────────────────────────
function calculateTax(income, residentType) {
  const brackets = BRACKETS[residentType] ?? BRACKETS.australian;
  for (let i = brackets.length - 1; i >= 0; i--) {
    if (income > brackets[i][0]) {
      return Math.max(0, brackets[i][2] + (income - brackets[i][0]) * brackets[i][1]);
    }
  }
  return 0;
}

// ── LITO (Australian residents only) ────────────────────────────────────────
// Source: ATO — max $700, phases out at $37,500 and $45,000
function calculateLITO(income) {
  if (income <= 37500) return 700;
  if (income <= 45000) return Math.max(0, 700  - (income - 37500)  * 0.05);
  if (income <= 66667) return Math.max(0, 325  - (income - 45000)  * 0.015);
  return 0;
}

// ── Medicare Levy ────────────────────────────────────────────────────────────
// 2024-25 thresholds (singles): lower $27,222 / upper $34,027
// Shade-in rate: 10 cents per $1 above lower threshold
const MEDICARE_LOWER = 27222;
const MEDICARE_UPPER = 34027;
const MEDICARE_RATE  = 0.02;
const MEDICARE_SHADE = 0.10;

function calculateMedicare(income) {
  let levy = 0;
  if (income <= MEDICARE_LOWER) {
    levy = 0;
  } else if (income < MEDICARE_UPPER) {
    levy = (income - MEDICARE_LOWER) * MEDICARE_SHADE;
  } else {
    levy = income * MEDICARE_RATE;
  }
  return { levy: Math.round(levy * 100) / 100, surcharge: 0 };
}

// ── HECS/HELP Repayment ──────────────────────────────────────────────────────
// 2024-25 repayment income thresholds and rates
// Source: ATO study-and-training-support-loans-rates-and-repayment-thresholds
const HECS_TIERS = [
  [159664, 0.100],
  [150627, 0.095],
  [142101, 0.090],
  [134057, 0.085],
  [126468, 0.080],
  [119310, 0.075],
  [112557, 0.070],
  [106186, 0.065],
  [100175, 0.060],
  [94504,  0.055],
  [89155,  0.050],
  [84108,  0.045],
  [79347,  0.040],
  [74856,  0.035],
  [70619,  0.030],
  [66621,  0.025],
  [62851,  0.020],
  [54435,  0.010],
];

function calculateHECS(income) {
  for (const [min, rate] of HECS_TIERS) {
    if (income >= min) return Math.round(income * rate * 100) / 100;
  }
  return 0;
}

// ── Bracket breakdown (for results display) ──────────────────────────────────
// Returns array of { from, to, rate, amount } for each bracket that income
// passes through, so the UI can render a "step-by-step" breakdown.
function getBracketBreakdown(income, residentType) {
  const brackets = BRACKETS[residentType] ?? BRACKETS.australian;
  const items = [];

  for (let i = 0; i < brackets.length; i++) {
    const [threshold, rate] = brackets[i];
    if (income <= threshold) break;

    const nextThreshold = i + 1 < brackets.length ? brackets[i + 1][0] : Infinity;
    const to     = Math.min(income, nextThreshold);
    const amount = Math.round((to - threshold) * rate * 100) / 100;
    items.push({ from: threshold, to, rate, amount });
  }

  return items;
}

// ── Full tax calculation (used by app/calculator.html) ───────────────────────
function calculateFullTax({ grossIncome, totalDeductions, type, hasHECS, medicareExempt, paygWithheld }) {
  const taxableIncome = Math.max(0, grossIncome - totalDeductions);
  const incomeTax     = calculateTax(taxableIncome, type);
  const lito          = type === 'australian' ? calculateLITO(taxableIncome) : 0;
  const taxAfterLITO  = Math.max(0, incomeTax - lito);

  // Medicare: Australian residents only, unless exempt
  const medicareLevy = (type === 'australian' && !medicareExempt)
    ? calculateMedicare(taxableIncome).levy
    : 0;

  const hecsRepayment  = hasHECS ? calculateHECS(taxableIncome) : 0;
  const totalLiability = taxAfterLITO + medicareLevy + hecsRepayment;
  const refundOrOwed   = paygWithheld - totalLiability; // positive = refund

  return {
    grossIncome,
    totalDeductions,
    taxableIncome,
    incomeTax,
    lito,
    taxAfterLITO,
    medicareLevy,
    hecsRepayment,
    totalLiability,
    paygWithheld,
    refundOrOwed,
    bracketBreakdown: getBracketBreakdown(taxableIncome, type),
  };
}
