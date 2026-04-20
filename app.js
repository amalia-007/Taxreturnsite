'use strict';

const num   = id => parseFloat(document.getElementById(id)?.value) || 0;
const check = id => !!document.getElementById(id)?.checked;
const radio = name => document.querySelector(`[name="${name}"]:checked`)?.value ?? '';
const fmt   = n => (n < 0 ? '-' : '') + '$' + Math.abs(Math.round(n)).toLocaleString('en-AU', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const set   = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = fmt(n); };

function runCalculation() {
  const panel = document.getElementById('results-panel');
  panel?.classList.add('is-calculating');

  const type = radio('residentType') || 'australian';

  const gross = num('salary-wages') + num('allowances') + num('tips-bonuses') +
    num('interest-income') + num('dividends') + num('franking-credits') +
    num('rental-income') + num('capital-gains') + num('foreign-income') +
    num('government-payments') + num('other-income');

  const deductions = num('work-related-travel') + num('uniform-clothing') +
    num('home-office') + num('self-education') + num('tools-equipment') +
    num('union-fees') + num('income-protection') + num('donations') +
    num('tax-agent-fees') + num('rental-deductions') + num('other-deductions');

  const taxable = Math.max(0, gross - deductions);
  const tax     = calculateTax(taxable, type);
  const lito    = type === 'australian' ? calculateLITO(taxable) : 0;

  const isAuOrWHM    = type === 'australian' || type === 'whm';
  const privatecover = check('medicare-surcharge') || num('private-hospital-cover') > 182;
  const { levy, surcharge } = isAuOrWHM
    ? calculateMedicare(taxable, privatecover)
    : { levy: 0, surcharge: 0 };
  const medicareLevy      = radio('medicareStatus') === 'exempt' ? 0 : levy;
  const medicareSurcharge = radio('medicareStatus') === 'exempt' ? 0 : surcharge;

  const hecs         = check('hecs-debt') ? calculateHECS(taxable) : 0;
  const frankingCr   = num('franking-credits');
  const foreignOff   = num('foreign-tax-offset');
  const totalOffsets = lito + frankingCr + foreignOff;
  const withheld     = num('tax-withheld-salary') + num('tax-withheld-interest') +
    num('tax-withheld-dividends') + num('tax-withheld-other');
  const payg         = num('instalment-credits');
  const grossTax     = tax + medicareLevy + medicareSurcharge + hecs;
  const outcome      = grossTax - totalOffsets - withheld - payg;

  set('result-gross-income',      gross);
  set('result-total-deductions',  deductions);
  set('result-taxable-income',    taxable);
  set('result-income-tax',        tax);
  set('result-medicare-levy',     medicareLevy);
  set('result-medicare-surcharge',medicareSurcharge);
  set('result-hecs-repayment',    hecs);
  set('result-gross-tax',         grossTax);
  set('result-lito',              lito);
  set('result-lmito',             0);
  set('result-sapto',             0);
  set('result-franking',          frankingCr);
  set('result-foreign-offset',    foreignOff);
  set('result-other-offsets',     0);
  set('result-total-offsets',     totalOffsets);
  set('result-tax-withheld',      withheld);
  set('result-payg-credits',      payg);

  const outcomeEl    = document.getElementById('result-outcome');
  const outcomeLabel = document.getElementById('outcome-label');
  const group        = document.querySelector('.results-group--final');
  if (outcomeEl && group) {
    // Remove classes then force reflow so outcomePop animation replays each update
    group.classList.remove('is-refund', 'is-owing');
    void group.offsetHeight;
    if (outcome < 0) {
      outcomeEl.textContent = fmt(Math.abs(outcome));
      if (outcomeLabel) outcomeLabel.textContent = '🎉 Tax Refund';
      group.classList.add('is-refund');
    } else if (outcome > 0) {
      outcomeEl.textContent = fmt(outcome);
      if (outcomeLabel) outcomeLabel.textContent = '⚠️ Tax Owing';
      group.classList.add('is-owing');
    } else {
      outcomeEl.textContent = fmt(0);
      if (outcomeLabel) outcomeLabel.textContent = 'Tax Payable / Refund';
    }
  }

  setTimeout(() => panel?.classList.remove('is-calculating'), 350);
}

// ── Resident rules — sections that show/hide per resident type ─────────────
const RESIDENT_RULES = {
  australian:  { hideSections: [],                     hideOffsets: [] },
  whm:         { hideSections: [],                     hideOffsets: ['lito-eligible','lmito-eligible','sapto-eligible'] },
  foreign:     { hideSections: ['accordion-medicare'],  hideOffsets: ['lito-eligible','lmito-eligible','sapto-eligible'] },
  nonresident: { hideSections: ['accordion-medicare'],  hideOffsets: ['lito-eligible','lmito-eligible','sapto-eligible'] },
};

function applyResidentRules(type) {
  const rules = RESIDENT_RULES[type] || RESIDENT_RULES.australian;
  const allSections = ['accordion-medicare'];
  const allOffsets  = ['lito-eligible','lmito-eligible','sapto-eligible'];

  allSections.forEach(id => {
    const el = document.getElementById(id);
    if (el) el.hidden = rules.hideSections.includes(id);
  });

  allOffsets.forEach(id => {
    const row = document.getElementById(id)?.closest('.field-row');
    if (row) row.hidden = rules.hideOffsets.includes(id);
  });
}

// ── Language ───────────────────────────────────────────────────────────────
function setLanguage(lang) {
  const t = (translations && translations[lang]) ? translations[lang] : translations.en;
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (t[key] !== undefined) el.textContent = t[key];
  });
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('lang-btn--active', btn.dataset.lang === lang);
  });
  document.documentElement.lang = lang;
  localStorage.setItem('lang', lang);
}

// ── Modal ──────────────────────────────────────────────────────────────────
const modal     = document.getElementById('tooltip-modal');
const modalBody = document.getElementById('tooltip-modal-body');

function openModal(key) {
  const lang  = localStorage.getItem('lang') || 'fr';
  const t     = (translations && translations[lang]) ? translations[lang] : translations.en;
  const label = key.replace('.tooltip', '.label');
  const titleEl = document.getElementById('tooltip-modal-title');
  if (titleEl) titleEl.textContent = t[label] || t['modal.title'] || 'Info';
  if (modalBody) modalBody.textContent = t[key] || key;
  modal?.showModal();
}
function closeModal() { modal?.close(); }

// ── Init ───────────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  document.getElementById('btn-calculate')?.addEventListener('click', runCalculation);
  document.querySelectorAll('#tax-form input, #tax-form select').forEach(el => {
    el.addEventListener('change', runCalculation);
    el.addEventListener('input',  runCalculation);
  });

  document.querySelectorAll('[name="residentType"]').forEach(el =>
    el.addEventListener('change', () => applyResidentRules(el.value)));
  applyResidentRules(radio('residentType') || 'australian');

  const savedLang = localStorage.getItem('lang') || 'fr';
  setLanguage(savedLang);

  document.querySelectorAll('.lang-btn').forEach(btn =>
    btn.addEventListener('click', () => setLanguage(btn.dataset.lang)));

  document.querySelectorAll('.tooltip-btn').forEach(btn =>
    btn.addEventListener('click', () => openModal(btn.dataset.tooltip)));
  document.getElementById('tooltip-modal-close')?.addEventListener('click', closeModal);
  modal?.addEventListener('click', e => { if (e.target === modal) closeModal(); });

  // Accordion: intercept close click to play exit animation before toggling
  document.querySelectorAll('.accordion-summary').forEach(summary => {
    summary.addEventListener('click', e => {
      const details = summary.closest('details');
      if (details.open) {
        e.preventDefault();
        details.classList.add('is-closing');
        setTimeout(() => {
          details.classList.remove('is-closing');
          details.open = false;
        }, 200);
      }
    });
  });

  // Mobile: tap panel heading to expand/collapse
  const panel = document.getElementById('results-panel');
  const panelHeading = panel?.querySelector('h2');
  panelHeading?.addEventListener('click', () => {
    if (window.innerWidth < 1024) panel.classList.toggle('is-open');
  });

  runCalculation();
});
