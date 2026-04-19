'use strict';

var translations = {

  fr: {
    // Page
    'page.title':   'Calculateur de Tax Return Australien',
    'header.title': 'Calculateur de Tax Return Australien',

    // Language buttons
    'lang.fr': '🇫🇷 FR',
    'lang.en': '🇬🇧 EN',
    'lang.es': '🇪🇸 ES',
    'lang.it': '🇮🇹 IT',

    // Resident type
    'resident.heading':              'Sélectionnez votre statut de résident',
    'resident.subtext':              'Votre statut de résidence détermine les taux et règles applicables à votre déclaration.',
    'resident.australian.title':     'Résident Australien',
    'resident.australian.desc':      'Imposé sur les revenus mondiaux. Éligible au seuil d\'exonération fiscale.',
    'resident.whm.title':            'Vacancier-Travailleur',
    'resident.whm.subtitle':         'PVT 417 / 462',
    'resident.whm.desc':             'Taux fixe de 15 % sur les premiers 45 000 $. Taux spéciaux au-delà.',
    'resident.foreign.title':        'Résident Étranger',
    'resident.foreign.desc':         'Imposé uniquement sur les revenus australiens. Pas de seuil d\'exonération.',
    'resident.nonresident.title':    'Non-Résident',
    'resident.nonresident.desc':     'Taux de retenue spécifiques. Pas de prélèvement Medicare.',

    // Year
    'year.heading':       'Année Fiscale',
    'year.label':         'Sélectionner l\'année fiscale',
    'year.option.2025':   '2024–25',
    'year.option.2024':   '2023–24',
    'year.option.2023':   '2022–23',

    // Income section
    'section.income':               'Revenus',
    'income.salary.label':          'Salaire et Traitements',
    'income.allowances.label':      'Indemnités',
    'income.tips.label':            'Pourboires et Primes',
    'income.interest.label':        'Revenus d\'Intérêts',
    'income.dividends.label':       'Dividendes',
    'income.frankingCredits.label': 'Crédits de Dividendes',
    'income.rental.label':          'Revenus Locatifs',
    'income.capitalGains.label':    'Plus-Values',
    'income.foreign.label':         'Revenus Étrangers',
    'income.govPayments.label':     'Prestations Gouvernementales',
    'income.other.label':           'Autres Revenus',

    // Tax paid section
    'section.taxPaid':                    'Impôts Payés',
    'taxPaid.withheldSalary.label':       'Retenue sur Salaire',
    'taxPaid.withheldInterest.label':     'Retenue sur Intérêts',
    'taxPaid.withheldDividends.label':    'Retenue sur Dividendes',
    'taxPaid.withheldOther.label':        'Retenue — Autres Sources',
    'taxPaid.instalmentCredits.label':    'Crédits d\'Acomptes PAYG',

    // Deductions section
    'section.deductions':                   'Déductions',
    'deductions.workTravel.label':          'Frais de Déplacement Professionnels',
    'deductions.uniform.label':             'Uniformes et Vêtements',
    'deductions.homeOffice.label':          'Frais de Bureau à Domicile',
    'deductions.selfEducation.label':       'Frais de Formation',
    'deductions.tools.label':               'Outils et Équipements',
    'deductions.unionFees.label':           'Cotisations Syndicales et Professionnelles',
    'deductions.incomeProtection.label':    'Assurance de Protection des Revenus',
    'deductions.donations.label':           'Dons Caritatifs (DGR)',
    'deductions.taxAgentFees.label':        'Honoraires d\'Agent Fiscal',
    'deductions.rental.label':              'Charges Locatives',
    'deductions.other.label':               'Autres Déductions',

    // Offsets section
    'section.offsets':                       'Réductions Fiscales',
    'offsets.lito.label':                    'Réduction Faibles Revenus (LITO)',
    'offsets.lmito.label':                   'Réduction Revenus Moyens (LMITO)',
    'offsets.sapto.label':                   'Réduction Seniors et Retraités (SAPTO)',
    'offsets.foreignTax.label':              'Crédit Impôt Étranger',
    'offsets.privateHealth.label':           'Réduction Assurance Santé Privée',
    'offsets.spouseContributions.label':     'Crédit Cotisations Super Conjoint',

    // Medicare section
    'section.medicare':                  'Medicare',
    'medicare.levy.legend':              'Prélèvement Medicare',
    'medicare.levy.full':                'Prélèvement Complet (2 %)',
    'medicare.levy.reduction':           'Réduction (faibles revenus)',
    'medicare.levy.exempt':              'Exempté',
    'medicare.surcharge.label':          'Surtaxe Medicare applicable',
    'medicare.privateHospital.label':    'Jours de Couverture Hospitalière Privée',
    'medicare.dependants.label':         'Avoir des enfants ou étudiants à charge',
    'medicare.dependantsCount.label':    'Nombre de Personnes à Charge',

    // HECS section
    'section.hecs':           'HECS / HELP',
    'hecs.hasDebt.label':     'J\'ai une dette HECS-HELP',
    'hecs.balance.label':     'Solde HECS Restant',
    'hecs.ssl.label':         'J\'ai un prêt Student Start-up (SSL)',
    'hecs.vsl.label':         'J\'ai un prêt VET Student (VSL)',
    'hecs.withheld.label':    'Montants HECS Déjà Retenus',

    // Form actions
    'form.calculate': 'Calculer',
    'form.reset':      'Réinitialiser',

    // Results panel
    'results.heading':              'Résumé Fiscal',
    'results.disclaimer':           'Estimations uniquement. Consultez un agent fiscal agréé.',
    'results.group.income':         'Revenus',
    'results.grossIncome':          'Revenu Brut',
    'results.totalDeductions':      'Total des Déductions',
    'results.taxableIncome':        'Revenu Imposable',
    'results.group.tax':            'Calcul de l\'Impôt',
    'results.incomeTax':            'Impôt sur le Revenu',
    'results.medicareLevy':         'Prélèvement Medicare',
    'results.medicareSurcharge':    'Surtaxe Medicare',
    'results.hecsRepayment':        'Remboursement HECS / HELP',
    'results.grossTaxLiability':    'Impôt Brut Total',
    'results.group.offsets':        'Réductions et Crédits',
    'results.lito':                 'LITO',
    'results.lmito':                'LMITO',
    'results.sapto':                'SAPTO',
    'results.frankingCreditsResult':'Crédits de Dividendes',
    'results.foreignTaxOffset':     'Crédit Impôt Étranger',
    'results.otherOffsets':         'Autres Réductions',
    'results.totalOffsets':         'Total des Réductions',
    'results.group.credits':        'Impôts Déjà Payés',
    'results.taxWithheld':          'Impôt Retenu à la Source',
    'results.paygCredits':          'Crédits d\'Acomptes PAYG',
    'results.outcome.default':      'Impôt à Payer / Remboursement',

    // Footer
    'footer.disclaimer': 'Ce calculateur fournit des estimations uniquement et ne constitue pas un conseil fiscal.',
    'footer.taxYear':    'Taux basés sur le barème ATO pour l\'année fiscale sélectionnée.',

    // Modal
    'modal.title': 'Plus d\'informations',
  },

  en: {
    // Page
    'page.title':   'Australian Tax Return Calculator',
    'header.title': 'Australian Tax Return Calculator',

    // Language buttons
    'lang.fr': '🇫🇷 FR',
    'lang.en': '🇬🇧 EN',
    'lang.es': '🇪🇸 ES',
    'lang.it': '🇮🇹 IT',

    // Resident type
    'resident.heading':              'Select Your Resident Type',
    'resident.subtext':              'Your residency status determines which tax rates and rules apply to your return.',
    'resident.australian.title':     'Australian Resident',
    'resident.australian.desc':      'Taxed on worldwide income. Eligible for tax-free threshold.',
    'resident.whm.title':            'Working Holiday Maker',
    'resident.whm.subtitle':         'WHM 417 / 462',
    'resident.whm.desc':             'Flat 15% on first $45,000. Special rates apply above that threshold.',
    'resident.foreign.title':        'Foreign Resident',
    'resident.foreign.desc':         'Taxed on Australian-sourced income only. No tax-free threshold.',
    'resident.nonresident.title':    'Non-Resident',
    'resident.nonresident.desc':     'Specific withholding tax rates. No Medicare levy applies.',

    // Year
    'year.heading':       'Financial Year',
    'year.label':         'Select financial year',
    'year.option.2025':   '2024–25',
    'year.option.2024':   '2023–24',
    'year.option.2023':   '2022–23',

    // Income section
    'section.income':               'Income',
    'income.salary.label':          'Salary & Wages',
    'income.allowances.label':      'Allowances',
    'income.tips.label':            'Tips & Bonuses',
    'income.interest.label':        'Interest Income',
    'income.dividends.label':       'Dividends',
    'income.frankingCredits.label': 'Franking Credits',
    'income.rental.label':          'Rental Income',
    'income.capitalGains.label':    'Capital Gains',
    'income.foreign.label':         'Foreign Income',
    'income.govPayments.label':     'Government Payments',
    'income.other.label':           'Other Income',

    // Tax paid section
    'section.taxPaid':                    'Tax Paid',
    'taxPaid.withheldSalary.label':       'Tax Withheld from Salary',
    'taxPaid.withheldInterest.label':     'Tax Withheld from Interest',
    'taxPaid.withheldDividends.label':    'Tax Withheld from Dividends',
    'taxPaid.withheldOther.label':        'Tax Withheld from Other Sources',
    'taxPaid.instalmentCredits.label':    'PAYG Instalment Credits',

    // Deductions section
    'section.deductions':                   'Deductions',
    'deductions.workTravel.label':          'Work-Related Travel',
    'deductions.uniform.label':             'Uniform & Clothing',
    'deductions.homeOffice.label':          'Home Office Expenses',
    'deductions.selfEducation.label':       'Self-Education Expenses',
    'deductions.tools.label':               'Tools & Equipment',
    'deductions.unionFees.label':           'Union & Professional Fees',
    'deductions.incomeProtection.label':    'Income Protection Insurance',
    'deductions.donations.label':           'Charitable Donations (DGR)',
    'deductions.taxAgentFees.label':        'Tax Agent Fees',
    'deductions.rental.label':              'Rental Property Expenses',
    'deductions.other.label':               'Other Deductions',

    // Offsets section
    'section.offsets':                       'Offsets',
    'offsets.lito.label':                    'Low Income Tax Offset (LITO)',
    'offsets.lmito.label':                   'Low & Middle Income Tax Offset (LMITO)',
    'offsets.sapto.label':                   'Seniors & Pensioners Offset (SAPTO)',
    'offsets.foreignTax.label':              'Foreign Income Tax Offset',
    'offsets.privateHealth.label':           'Private Health Insurance Offset',
    'offsets.spouseContributions.label':     'Spouse Super Contributions Offset',

    // Medicare section
    'section.medicare':                  'Medicare',
    'medicare.levy.legend':              'Medicare Levy',
    'medicare.levy.full':                'Full Medicare Levy (2%)',
    'medicare.levy.reduction':           'Reduction (low income)',
    'medicare.levy.exempt':              'Exempt',
    'medicare.surcharge.label':          'Medicare Levy Surcharge applies',
    'medicare.privateHospital.label':    'Private Hospital Cover Days',
    'medicare.dependants.label':         'Have dependant children or students',
    'medicare.dependantsCount.label':    'Number of Dependants',

    // HECS section
    'section.hecs':           'HECS / HELP',
    'hecs.hasDebt.label':     'I have a HECS-HELP debt',
    'hecs.balance.label':     'Outstanding HECS Balance',
    'hecs.ssl.label':         'I have a Student Start-up Loan (SSL)',
    'hecs.vsl.label':         'I have a VET Student Loan (VSL)',
    'hecs.withheld.label':    'HECS Amounts Already Withheld',

    // Form actions
    'form.calculate': 'Calculate',
    'form.reset':      'Reset',

    // Results panel
    'results.heading':              'Your Tax Summary',
    'results.disclaimer':           'Estimates only. Not financial advice. Always consult a registered tax agent.',
    'results.group.income':         'Income',
    'results.grossIncome':          'Gross Income',
    'results.totalDeductions':      'Total Deductions',
    'results.taxableIncome':        'Taxable Income',
    'results.group.tax':            'Tax Calculation',
    'results.incomeTax':            'Income Tax',
    'results.medicareLevy':         'Medicare Levy',
    'results.medicareSurcharge':    'Medicare Levy Surcharge',
    'results.hecsRepayment':        'HECS / HELP Repayment',
    'results.grossTaxLiability':    'Gross Tax Liability',
    'results.group.offsets':        'Offsets & Credits',
    'results.lito':                 'LITO',
    'results.lmito':                'LMITO',
    'results.sapto':                'SAPTO',
    'results.frankingCreditsResult':'Franking Credits',
    'results.foreignTaxOffset':     'Foreign Tax Offset',
    'results.otherOffsets':         'Other Offsets',
    'results.totalOffsets':         'Total Offsets',
    'results.group.credits':        'Tax Already Paid',
    'results.taxWithheld':          'Tax Withheld',
    'results.paygCredits':          'PAYG Instalment Credits',
    'results.outcome.default':      'Tax Payable / Refund',

    // Footer
    'footer.disclaimer': 'This calculator provides estimates only and does not constitute financial or tax advice.',
    'footer.taxYear':    'Tax rates based on ATO schedule for the selected financial year.',

    // Modal
    'modal.title': 'More Information',
  },

  es: {
    // Page
    'page.title':   'Calculadora de Tax Return Australiano',
    'header.title': 'Calculadora de Tax Return Australiano',

    // Language buttons
    'lang.fr': '🇫🇷 FR',
    'lang.en': '🇬🇧 EN',
    'lang.es': '🇪🇸 ES',
    'lang.it': '🇮🇹 IT',

    // Resident type
    'resident.heading':              'Seleccione su tipo de residencia',
    'resident.subtext':              'Su estado de residencia determina las tasas y reglas aplicables a su declaración.',
    'resident.australian.title':     'Residente Australiano',
    'resident.australian.desc':      'Tributado sobre ingresos mundiales. Elegible para el umbral libre de impuestos.',
    'resident.whm.title':            'Trabajador Vacacional',
    'resident.whm.subtitle':         'WHM 417 / 462',
    'resident.whm.desc':             'Tasa fija del 15% sobre los primeros $45.000. Tasas especiales por encima.',
    'resident.foreign.title':        'Residente Extranjero',
    'resident.foreign.desc':         'Tributado solo sobre ingresos de fuente australiana. Sin umbral libre de impuestos.',
    'resident.nonresident.title':    'No Residente',
    'resident.nonresident.desc':     'Tasas de retención específicas. Sin recargo Medicare.',

    // Year
    'year.heading':       'Año Fiscal',
    'year.label':         'Seleccionar año fiscal',
    'year.option.2025':   '2024–25',
    'year.option.2024':   '2023–24',
    'year.option.2023':   '2022–23',

    // Income section
    'section.income':               'Ingresos',
    'income.salary.label':          'Salario y Sueldos',
    'income.allowances.label':      'Asignaciones',
    'income.tips.label':            'Propinas y Bonificaciones',
    'income.interest.label':        'Ingresos por Intereses',
    'income.dividends.label':       'Dividendos',
    'income.frankingCredits.label': 'Créditos de Dividendos',
    'income.rental.label':          'Ingresos por Alquiler',
    'income.capitalGains.label':    'Ganancias de Capital',
    'income.foreign.label':         'Ingresos Extranjeros',
    'income.govPayments.label':     'Pagos Gubernamentales',
    'income.other.label':           'Otros Ingresos',

    // Tax paid section
    'section.taxPaid':                    'Impuestos Pagados',
    'taxPaid.withheldSalary.label':       'Retención sobre Salario',
    'taxPaid.withheldInterest.label':     'Retención sobre Intereses',
    'taxPaid.withheldDividends.label':    'Retención sobre Dividendos',
    'taxPaid.withheldOther.label':        'Retención — Otras Fuentes',
    'taxPaid.instalmentCredits.label':    'Créditos de Cuotas PAYG',

    // Deductions section
    'section.deductions':                   'Deducciones',
    'deductions.workTravel.label':          'Gastos de Viaje Laboral',
    'deductions.uniform.label':             'Uniforme y Ropa',
    'deductions.homeOffice.label':          'Gastos de Oficina en Casa',
    'deductions.selfEducation.label':       'Gastos de Formación',
    'deductions.tools.label':               'Herramientas y Equipos',
    'deductions.unionFees.label':           'Cuotas Sindicales y Profesionales',
    'deductions.incomeProtection.label':    'Seguro de Protección de Ingresos',
    'deductions.donations.label':           'Donaciones Caritativas (DGR)',
    'deductions.taxAgentFees.label':        'Honorarios de Agente Fiscal',
    'deductions.rental.label':              'Gastos de Propiedad de Alquiler',
    'deductions.other.label':               'Otras Deducciones',

    // Offsets section
    'section.offsets':                       'Reducciones Fiscales',
    'offsets.lito.label':                    'Reducción por Bajos Ingresos (LITO)',
    'offsets.lmito.label':                   'Reducción Ingresos Medios (LMITO)',
    'offsets.sapto.label':                   'Reducción Mayores y Pensionistas (SAPTO)',
    'offsets.foreignTax.label':              'Crédito Impuesto Extranjero',
    'offsets.privateHealth.label':           'Reducción Seguro Salud Privado',
    'offsets.spouseContributions.label':     'Crédito Aportaciones Super Cónyuge',

    // Medicare section
    'section.medicare':                  'Medicare',
    'medicare.levy.legend':              'Recargo Medicare',
    'medicare.levy.full':                'Recargo Medicare Completo (2%)',
    'medicare.levy.reduction':           'Reducción (bajos ingresos)',
    'medicare.levy.exempt':              'Exento',
    'medicare.surcharge.label':          'Sobretasa Medicare aplicable',
    'medicare.privateHospital.label':    'Días de Cobertura Hospitalaria Privada',
    'medicare.dependants.label':         'Tener hijos o estudiantes dependientes',
    'medicare.dependantsCount.label':    'Número de Dependientes',

    // HECS section
    'section.hecs':           'HECS / HELP',
    'hecs.hasDebt.label':     'Tengo una deuda HECS-HELP',
    'hecs.balance.label':     'Saldo HECS Pendiente',
    'hecs.ssl.label':         'Tengo un Préstamo de Inicio Estudiantil (SSL)',
    'hecs.vsl.label':         'Tengo un Préstamo VET Student (VSL)',
    'hecs.withheld.label':    'Montos HECS Ya Retenidos',

    // Form actions
    'form.calculate': 'Calcular',
    'form.reset':      'Reiniciar',

    // Results panel
    'results.heading':              'Resumen Fiscal',
    'results.disclaimer':           'Solo estimaciones. Consulte a un agente fiscal registrado.',
    'results.group.income':         'Ingresos',
    'results.grossIncome':          'Ingreso Bruto',
    'results.totalDeductions':      'Total de Deducciones',
    'results.taxableIncome':        'Ingreso Imponible',
    'results.group.tax':            'Cálculo del Impuesto',
    'results.incomeTax':            'Impuesto sobre la Renta',
    'results.medicareLevy':         'Recargo Medicare',
    'results.medicareSurcharge':    'Sobretasa Medicare',
    'results.hecsRepayment':        'Reembolso HECS / HELP',
    'results.grossTaxLiability':    'Obligación Fiscal Bruta',
    'results.group.offsets':        'Reducciones y Créditos',
    'results.lito':                 'LITO',
    'results.lmito':                'LMITO',
    'results.sapto':                'SAPTO',
    'results.frankingCreditsResult':'Créditos de Dividendos',
    'results.foreignTaxOffset':     'Crédito Impuesto Extranjero',
    'results.otherOffsets':         'Otras Reducciones',
    'results.totalOffsets':         'Total de Reducciones',
    'results.group.credits':        'Impuestos Ya Pagados',
    'results.taxWithheld':          'Impuesto Retenido',
    'results.paygCredits':          'Créditos de Cuotas PAYG',
    'results.outcome.default':      'Impuesto a Pagar / Devolución',

    // Footer
    'footer.disclaimer': 'Esta calculadora proporciona solo estimaciones y no constituye asesoramiento fiscal.',
    'footer.taxYear':    'Tasas basadas en el cronograma ATO para el año fiscal seleccionado.',

    // Modal
    'modal.title': 'Más Información',
  },

  it: {
    // Page
    'page.title':   'Calcolatore Tax Return Australiano',
    'header.title': 'Calcolatore Tax Return Australiano',

    // Language buttons
    'lang.fr': '🇫🇷 FR',
    'lang.en': '🇬🇧 EN',
    'lang.es': '🇪🇸 ES',
    'lang.it': '🇮🇹 IT',

    // Resident type
    'resident.heading':              'Seleziona il tipo di residenza',
    'resident.subtext':              'Il tuo stato di residenza determina le aliquote e le regole applicabili alla dichiarazione.',
    'resident.australian.title':     'Residente Australiano',
    'resident.australian.desc':      'Tassato sui redditi mondiali. Idoneo alla soglia esentasse.',
    'resident.whm.title':            'Lavoratore in Vacanza',
    'resident.whm.subtitle':         'WHM 417 / 462',
    'resident.whm.desc':             'Aliquota fissa del 15% sui primi $45.000. Aliquote speciali oltre tale soglia.',
    'resident.foreign.title':        'Residente Straniero',
    'resident.foreign.desc':         'Tassato solo sui redditi di fonte australiana. Nessuna soglia esentasse.',
    'resident.nonresident.title':    'Non Residente',
    'resident.nonresident.desc':     'Aliquote di ritenuta specifiche. Nessun contributo Medicare applicabile.',

    // Year
    'year.heading':       'Anno Fiscale',
    'year.label':         'Seleziona anno fiscale',
    'year.option.2025':   '2024–25',
    'year.option.2024':   '2023–24',
    'year.option.2023':   '2022–23',

    // Income section
    'section.income':               'Redditi',
    'income.salary.label':          'Stipendio e Salari',
    'income.allowances.label':      'Indennità',
    'income.tips.label':            'Mance e Bonus',
    'income.interest.label':        'Redditi da Interessi',
    'income.dividends.label':       'Dividendi',
    'income.frankingCredits.label': 'Crediti di Imposta sui Dividendi',
    'income.rental.label':          'Redditi da Affitto',
    'income.capitalGains.label':    'Plusvalenze',
    'income.foreign.label':         'Redditi Esteri',
    'income.govPayments.label':     'Pagamenti Governativi',
    'income.other.label':           'Altri Redditi',

    // Tax paid section
    'section.taxPaid':                    'Imposte Pagate',
    'taxPaid.withheldSalary.label':       'Ritenuta su Stipendio',
    'taxPaid.withheldInterest.label':     'Ritenuta su Interessi',
    'taxPaid.withheldDividends.label':    'Ritenuta su Dividendi',
    'taxPaid.withheldOther.label':        'Ritenuta — Altre Fonti',
    'taxPaid.instalmentCredits.label':    'Crediti Rate PAYG',

    // Deductions section
    'section.deductions':                   'Deduzioni',
    'deductions.workTravel.label':          'Spese di Viaggio Lavorativo',
    'deductions.uniform.label':             'Divisa e Abbigliamento',
    'deductions.homeOffice.label':          'Spese Ufficio a Casa',
    'deductions.selfEducation.label':       'Spese di Formazione',
    'deductions.tools.label':               'Strumenti e Attrezzature',
    'deductions.unionFees.label':           'Quote Sindacali e Professionali',
    'deductions.incomeProtection.label':    'Assicurazione Protezione Reddito',
    'deductions.donations.label':           'Donazioni Benefiche (DGR)',
    'deductions.taxAgentFees.label':        'Onorari Agente Fiscale',
    'deductions.rental.label':              'Spese Proprietà in Affitto',
    'deductions.other.label':               'Altre Deduzioni',

    // Offsets section
    'section.offsets':                       'Detrazioni Fiscali',
    'offsets.lito.label':                    'Detrazione Redditi Bassi (LITO)',
    'offsets.lmito.label':                   'Detrazione Redditi Medi (LMITO)',
    'offsets.sapto.label':                   'Detrazione Anziani e Pensionati (SAPTO)',
    'offsets.foreignTax.label':              'Credito Imposta Estera',
    'offsets.privateHealth.label':           'Detrazione Assicurazione Sanitaria Privata',
    'offsets.spouseContributions.label':     'Credito Contributi Super Coniuge',

    // Medicare section
    'section.medicare':                  'Medicare',
    'medicare.levy.legend':              'Contributo Medicare',
    'medicare.levy.full':                'Contributo Medicare Pieno (2%)',
    'medicare.levy.reduction':           'Riduzione (redditi bassi)',
    'medicare.levy.exempt':              'Esente',
    'medicare.surcharge.label':          'Sovrattassa Medicare applicabile',
    'medicare.privateHospital.label':    'Giorni di Copertura Ospedaliera Privata',
    'medicare.dependants.label':         'Avere figli o studenti a carico',
    'medicare.dependantsCount.label':    'Numero di Persone a Carico',

    // HECS section
    'section.hecs':           'HECS / HELP',
    'hecs.hasDebt.label':     'Ho un debito HECS-HELP',
    'hecs.balance.label':     'Saldo HECS Residuo',
    'hecs.ssl.label':         'Ho un Prestito Student Start-up (SSL)',
    'hecs.vsl.label':         'Ho un Prestito VET Student (VSL)',
    'hecs.withheld.label':    'Importi HECS Già Trattenuti',

    // Form actions
    'form.calculate': 'Calcola',
    'form.reset':      'Reimposta',

    // Results panel
    'results.heading':              'Riepilogo Fiscale',
    'results.disclaimer':           'Solo stime. Consulta un agente fiscale registrato.',
    'results.group.income':         'Redditi',
    'results.grossIncome':          'Reddito Lordo',
    'results.totalDeductions':      'Totale Deduzioni',
    'results.taxableIncome':        'Reddito Imponibile',
    'results.group.tax':            'Calcolo dell\'Imposta',
    'results.incomeTax':            'Imposta sul Reddito',
    'results.medicareLevy':         'Contributo Medicare',
    'results.medicareSurcharge':    'Sovrattassa Medicare',
    'results.hecsRepayment':        'Rimborso HECS / HELP',
    'results.grossTaxLiability':    'Onere Fiscale Lordo',
    'results.group.offsets':        'Detrazioni e Crediti',
    'results.lito':                 'LITO',
    'results.lmito':                'LMITO',
    'results.sapto':                'SAPTO',
    'results.frankingCreditsResult':'Crediti di Imposta sui Dividendi',
    'results.foreignTaxOffset':     'Credito Imposta Estera',
    'results.otherOffsets':         'Altre Detrazioni',
    'results.totalOffsets':         'Totale Detrazioni',
    'results.group.credits':        'Imposte Già Pagate',
    'results.taxWithheld':          'Imposta Trattenuta',
    'results.paygCredits':          'Crediti Rate PAYG',
    'results.outcome.default':      'Imposta da Pagare / Rimborso',

    // Footer
    'footer.disclaimer': 'Questo calcolatore fornisce solo stime e non costituisce consulenza fiscale.',
    'footer.taxYear':    'Aliquote basate sul prospetto ATO per l\'anno fiscale selezionato.',

    // Modal
    'modal.title': 'Ulteriori Informazioni',
  },

};
