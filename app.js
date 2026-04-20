'use strict';

const num   = id => parseFloat((document.getElementById(id)?.value || '').replace(/,/g, '')) || 0;
const check = id => !!document.getElementById(id)?.checked;
const radio = name => document.querySelector(`[name="${name}"]:checked`)?.value ?? '';
const fmt   = n => (n < 0 ? '-' : '') + '$' + Math.abs(n).toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
const set   = (id, n) => { const el = document.getElementById(id); if (el) el.textContent = fmt(n); };

function tr(key) {
  const lang = localStorage.getItem('lang') || 'en';
  const tbl = (translations && translations[lang]) ? translations[lang] : translations.en;
  return tbl[key] !== undefined ? tbl[key] : key;
}

// ── Input validation & number formatting ──────────────────────────────────
function getOrCreateError(input) {
  let err = input.nextElementSibling;
  if (!err || !err.classList.contains('field-error')) {
    err = document.createElement('span');
    err.className = 'field-error';
    input.after(err);
  }
  return err;
}

function setFieldError(input, msg) {
  input.classList.add('is-invalid');
  getOrCreateError(input).textContent = msg;
}

function clearFieldError(input) {
  input.classList.remove('is-invalid');
  const err = input.nextElementSibling;
  if (err?.classList.contains('field-error')) err.textContent = '';
}

function formatNumberInput(input) {
  const sel = input.selectionStart;
  const raw = input.value;
  const isInt = input.inputMode === 'numeric';

  // Count non-comma chars before cursor to restore position after reformatting
  let sigBefore = 0;
  for (let i = 0; i < sel; i++) {
    if (raw[i] !== ',') sigBefore++;
  }

  // Strip invalid chars; allow one decimal point for non-integer fields
  let clean = raw.replace(isInt ? /[^0-9]/g : /[^0-9.]/g, '');
  if (!isInt) {
    const d = clean.indexOf('.');
    if (d >= 0) clean = clean.slice(0, d + 1) + clean.slice(d + 1).replace(/\./g, '');
  }

  // Add thousand-separator commas to integer part
  const d = clean.indexOf('.');
  const intPart = (d >= 0 ? clean.slice(0, d) : clean).replace(/\B(?=(\d{3})+(?!\d))/g, ',');
  const formatted = intPart + (d >= 0 ? clean.slice(d) : '');

  input.value = formatted;

  // Restore cursor: advance until sigBefore non-comma chars have been passed
  let count = 0, newSel = formatted.length;
  for (let i = 0; i < formatted.length; i++) {
    if (count === sigBefore) { newSel = i; break; }
    if (formatted[i] !== ',') count++;
  }
  input.setSelectionRange(newSel, newSel);
}

function handleNumberInput(input) {
  if (input.value.includes('-')) {
    setFieldError(input, tr('validation.negative'));
    input.value = input.value.replace(/-/g, '');
  } else {
    clearFieldError(input);
  }
  formatNumberInput(input);
}

function runCalculation() {
  const panel = document.getElementById('results-panel');
  panel?.classList.add('is-calculating');

  const type = radio('residentType') || 'australian';

  const gross = num('salary-wages') + num('allowances') + num('tips-bonuses') +
    num('interest-income') + num('dividends') + num('franking-credits') +
    num('rental-income') + num('capital-gains') + num('foreign-income') +
    num('government-payments') + num('abn-income') + num('other-income');

  const deductions = num('work-related-travel') + num('uniform-clothing') +
    num('home-office') + num('self-education') + num('tools-equipment') +
    num('union-fees') + num('income-protection') + num('donations') +
    num('tax-agent-fees') + num('rental-deductions') + num('other-deductions');

  const taxable = Math.max(0, gross - deductions);
  const tax     = calculateTax(taxable, type);
  const lito    = type === 'australian' ? calculateLITO(taxable) : 0;

  const privatecover = check('medicare-surcharge') || num('private-hospital-cover') > 182;
  const { levy, surcharge } = type === 'australian'
    ? calculateMedicare(taxable, privatecover)
    : { levy: 0, surcharge: 0 };
  const medicareLevy      = radio('medicareStatus') === 'exempt' ? 0 : levy;
  const medicareSurcharge = radio('medicareStatus') === 'exempt' ? 0 : surcharge;

  const hecs         = radio('hecsDebt') === 'yes' ? calculateHECS(taxable) : 0;
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
  const hecsRow = document.getElementById('result-hecs-repayment')?.closest('.results-row');
  if (hecsRow) hecsRow.hidden = radio('hecsDebt') !== 'yes';

  const litoRow = document.getElementById('result-lito')?.closest('.results-row');
  if (litoRow) litoRow.hidden = type !== 'australian';
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
  const peekOutcome  = document.getElementById('peek-outcome');
  const group        = document.querySelector('.results-group--final');
  if (outcomeEl && group) {
    // Remove classes then force reflow so outcomePop animation replays each update
    group.classList.remove('is-refund', 'is-owing');
    void group.offsetHeight;
    if (outcome < 0) {
      outcomeEl.textContent = fmt(Math.abs(outcome));
      if (outcomeLabel) outcomeLabel.textContent = tr('results.outcome.refund');
      group.classList.add('is-refund');
      if (peekOutcome) { peekOutcome.textContent = '· ' + fmt(Math.abs(outcome)); peekOutcome.className = 'peek-outcome peek-outcome--refund'; }
    } else if (outcome > 0) {
      outcomeEl.textContent = fmt(outcome);
      if (outcomeLabel) outcomeLabel.textContent = tr('results.outcome.owing');
      group.classList.add('is-owing');
      if (peekOutcome) { peekOutcome.textContent = '· ' + fmt(outcome); peekOutcome.className = 'peek-outcome peek-outcome--owing'; }
    } else {
      outcomeEl.textContent = fmt(0);
      if (outcomeLabel) outcomeLabel.textContent = tr('results.outcome.default');
      if (peekOutcome) { peekOutcome.textContent = ''; peekOutcome.className = 'peek-outcome'; }
    }
  }

  updateProgress();
  setTimeout(() => panel?.classList.remove('is-calculating'), 350);
}

// ── Progress bar ──────────────────────────────────────────────────────────
function isSectionFilled(accordion) {
  for (const el of accordion.querySelectorAll('input[type="text"]')) {
    if (el.closest('[hidden]')) continue;
    if (parseFloat(el.value.replace(/,/g, '')) > 0) return true;
  }
  for (const el of accordion.querySelectorAll('input[type="checkbox"]')) {
    if (el.closest('[hidden]')) continue;
    if (el.checked) return true;
  }
  for (const el of accordion.querySelectorAll('input[type="radio"]:checked')) {
    if (!el.closest('[hidden]')) return true;
  }
  return false;
}

function updateProgress() {
  const accordions = [...document.querySelectorAll('.accordion')].filter(a => !a.hidden);
  const total  = accordions.length;
  const filled = accordions.filter(isSectionFilled).length;
  const pct    = total > 0 ? Math.round((filled / total) * 100) : 0;
  const done   = filled === total && total > 0;

  const wrap = document.getElementById('progress-wrap');
  const fill = document.getElementById('progress-fill');
  const text = document.getElementById('progress-text');
  const pctEl = document.getElementById('progress-pct');

  if (fill)  { fill.style.width = pct + '%'; fill.classList.toggle('is-complete', done); }
  if (wrap)  { wrap.setAttribute('aria-valuenow', filled); wrap.classList.toggle('is-complete', done); }
  if (text) text.textContent = done
    ? tr('progress.done').replace('{t}', total)
    : tr('progress.text').replace('{f}', filled).replace('{t}', total);
  if (pctEl) pctEl.textContent = pct + '%';
}

// ── HECS sub-field show/hide ────────────────────────────────────────────────
function applyHecsRules() {
  const hasDebt = radio('hecsDebt') === 'yes';
  ['hecs-balance', 'ssl-debt', 'vsl-debt', 'hecs-withheld'].forEach(id => {
    const row = document.getElementById(id)?.closest('.field-row');
    if (row) row.hidden = !hasDebt;
  });
  runCalculation();
}

// ── Resident rules — sections that show/hide per resident type ─────────────
const RESIDENT_RULES = {
  australian:  { hideSections: [],                     hideOffsets: [] },
  whm:         { hideSections: ['accordion-medicare'],  hideOffsets: ['lito-eligible','lmito-eligible','sapto-eligible'] },
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
  runCalculation();
}

// ── Summary modal ──────────────────────────────────────────────────────────
const summaryModal = document.getElementById('summary-modal');

function esc(s) {
  return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function sumRow(label, value, cls = '') {
  return `<div class="sum-row${cls ? ' ' + cls : ''}"><dt>${esc(label)}</dt><dd>${esc(value)}</dd></div>`;
}

function sumSection(title, rows) {
  if (!rows.length) return '';
  return `<div class="sum-section"><h4 class="sum-section-title">${esc(title)}</h4><dl class="sum-dl">${rows.join('')}</dl></div>`;
}

function buildSummaryHTML() {
  const parts = [];

  // Details
  const residentEl   = document.querySelector('[name="residentType"]:checked');
  const residentName = residentEl?.closest('.resident-card')?.querySelector('.card-title')?.textContent?.trim() || '—';
  const yearEl       = document.getElementById('tax-year');
  const yearName     = yearEl ? yearEl.options[yearEl.selectedIndex]?.text : '—';
  parts.push(sumSection(tr('summary.section.details'), [
    sumRow(tr('summary.residentType'), residentName),
    sumRow(tr('summary.taxYear'), yearName),
  ]));

  // One section per accordion (skip hidden ones)
  document.querySelectorAll('.accordion:not([hidden])').forEach(acc => {
    const title = acc.querySelector('.accordion-title')?.textContent?.trim() || '';
    const rows  = [];

    acc.querySelectorAll('.field-row:not([hidden])').forEach(fieldRow => {
      const labelText = fieldRow.querySelector('label > span[data-i18n]')?.textContent?.trim();
      if (!labelText) return;

      const textInput = fieldRow.querySelector('input[type="text"]');
      const checkbox  = fieldRow.querySelector('input[type="checkbox"]');
      const radioChecked = fieldRow.querySelector('input[type="radio"]:checked');

      if (textInput) {
        const raw = parseFloat(textInput.value.replace(/,/g, '')) || 0;
        if (raw > 0) rows.push(sumRow(labelText, '$' + textInput.value));
      } else if (checkbox && checkbox.checked) {
        rows.push(sumRow(labelText, '✓ Yes'));
      } else if (radioChecked) {
        const optionLabel = fieldRow.querySelector('label > span[data-i18n]')?.textContent?.trim() || radioChecked.value;
        rows.push(sumRow('Selected', optionLabel));
      }
    });

    if (rows.length) parts.push(sumSection(title, rows));
  });

  // Calculation breakdown
  const resultFields = [
    ['result-gross-income',       'Gross Income'],
    ['result-total-deductions',   'Total Deductions'],
    ['result-taxable-income',     'Taxable Income',       'sum-row--subtotal sum-row--bold'],
    ['result-income-tax',         'Income Tax'],
    ['result-medicare-levy',      'Medicare Levy'],
    ['result-medicare-surcharge', 'Medicare Levy Surcharge'],
    ['result-hecs-repayment',     'HECS / HELP Repayment'],
    ['result-gross-tax',          'Gross Tax Liability',  'sum-row--subtotal sum-row--bold'],
    ['result-lito',               'LITO'],
    ['result-franking',           'Franking Credits'],
    ['result-foreign-offset',     'Foreign Tax Offset'],
    ['result-total-offsets',      'Total Offsets',        'sum-row--subtotal sum-row--bold'],
    ['result-tax-withheld',       'Tax Withheld'],
    ['result-payg-credits',       'PAYG Credits'],
  ];

  parts.push(sumSection(tr('summary.section.breakdown'),
    resultFields.map(([id, label, cls]) =>
      sumRow(label, document.getElementById(id)?.textContent || '$0.00', cls || '')
    )
  ));

  // Outcome
  const group        = document.querySelector('.results-group--final');
  const outcomeLabel = document.getElementById('outcome-label')?.textContent || 'Tax Payable / Refund';
  const outcomeVal   = document.getElementById('result-outcome')?.textContent || '$0.00';
  const outcomeClass = group?.classList.contains('is-refund') ? 'sum-outcome--refund'
                     : group?.classList.contains('is-owing')  ? 'sum-outcome--owing' : '';

  parts.push(`<div class="sum-outcome ${outcomeClass}">
    <div class="sum-outcome-label">${esc(outcomeLabel)}</div>
    <div class="sum-outcome-value">${esc(outcomeVal)}</div>
  </div>`);

  return parts.join('');
}

function openSummary() {
  const body = document.getElementById('summary-modal-body');
  if (body) body.innerHTML = buildSummaryHTML();
  summaryModal?.showModal();
}

function closeSummary() { summaryModal?.close(); }

// ── Modal ──────────────────────────────────────────────────────────────────
const modal     = document.getElementById('tooltip-modal');
const modalBody = document.getElementById('tooltip-modal-body');

function openModal(key) {
  const lang  = localStorage.getItem('lang') || 'en';
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
  document.getElementById('btn-calculate')?.addEventListener('click', () => {
    runCalculation();
    const panel = document.getElementById('results-panel');
    if (panel) {
      if (window.innerWidth < 1024) panel.classList.add('is-open');
      panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
    }
  });

  // Reset: clear validation state then recalculate to show $0.00
  document.getElementById('tax-form')?.addEventListener('reset', () => {
    document.querySelectorAll('#tax-form .is-invalid').forEach(el => el.classList.remove('is-invalid'));
    document.querySelectorAll('#tax-form .field-error').forEach(el => { el.textContent = ''; });
    applyResidentRules('australian');
    runCalculation();
    updateProgress();
  });

  // Summary
  document.getElementById('btn-summary')?.addEventListener('click', openSummary);
  document.getElementById('summary-modal-close')?.addEventListener('click', closeSummary);
  document.getElementById('summary-close-btn')?.addEventListener('click', closeSummary);
  document.getElementById('summary-print-btn')?.addEventListener('click', () => window.print());
  summaryModal?.addEventListener('click', e => { if (e.target === summaryModal) closeSummary(); });
  document.querySelectorAll('#tax-form input, #tax-form select').forEach(el => {
    el.addEventListener('change', runCalculation);
    el.addEventListener('input',  runCalculation);
  });

  // Validation + formatting for text (numeric) inputs
  document.querySelectorAll('#tax-form input[type="text"]').forEach(input => {
    input.addEventListener('input', () => handleNumberInput(input));
    input.addEventListener('blur', () => {
      if (!input.value.trim()) input.value = '0';
    });
  });

  document.querySelectorAll('[name="residentType"]').forEach(el =>
    el.addEventListener('change', () => applyResidentRules(el.value)));
  applyResidentRules(radio('residentType') || 'australian');

  document.querySelectorAll('[name="hecsDebt"]').forEach(el =>
    el.addEventListener('change', applyHecsRules));
  applyHecsRules();

  const savedLang = localStorage.getItem('lang') || 'en';
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
