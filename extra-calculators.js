/* Wealth Arrays — expansion calculator definitions.
   These tools are intentionally isolated from calculators.js so the stable
   production calculator registry remains untouched. */
(function () {
  'use strict';
  const extra = {
    'step-up-sip': {
      id: 'step-up-sip',
      title: 'Step-Up SIP Calculator',
      category: 'investment',
      short: 'Model a monthly investment that increases each year.',
      desc: 'Estimate how an annual increase in your monthly investment can change the projected portfolio value.',
      fields: [
        { id: 'monthly', label: 'Starting monthly investment', type: 'number', default: 5000, min: 0, step: 100 },
        { id: 'stepUp', label: 'Annual increase', type: 'number', default: 10, min: 0, max: 100, step: 0.5, suffix: '%' },
        { id: 'rate', label: 'Expected annual return', type: 'number', default: 10, min: 0, max: 100, step: 0.1, suffix: '%' },
        { id: 'years', label: 'Investment period', type: 'number', default: 15, min: 1, max: 60, step: 1, suffix: 'yrs' },
        { id: 'inflation', label: 'Expected annual inflation', type: 'number', default: 6, min: 0, max: 30, step: 0.1, suffix: '%' }
      ],
      compute(v) {
        const months = Math.max(0, Math.round(v.years * 12));
        const monthlyRate = v.rate / 100 / 12;
        const annualStep = 1 + v.stepUp / 100;
        let contribution = v.monthly;
        let future = 0;
        let invested = 0;
        for (let m = 1; m <= months; m++) {
          future = (future + contribution) * (1 + monthlyRate);
          invested += contribution;
          if (m % 12 === 0) contribution *= annualStep;
        }
        const realValue = future / Math.pow(1 + v.inflation / 100, v.years);
        return [
          { label: 'Total invested', value: invested, format: 'currency' },
          { label: 'Growth / profit', value: future - invested, format: 'currency', emphasis: 'positive' },
          { label: 'Projected future value', value: future, format: 'currency', emphasis: 'neutral' },
          { label: "Future value in today's money", value: realValue, format: 'currency', emphasis: 'neutral' }
        ];
      }
    },
    'emergency-fund': {
      id: 'emergency-fund',
      title: 'Emergency Fund Calculator',
      category: 'retirement',
      short: 'Estimate how much cash you may want for unexpected expenses.',
      desc: 'Build a simple emergency-fund target from essential monthly expenses and the number of months you want covered.',
      fields: [
        { id: 'expenses', label: 'Essential monthly expenses', type: 'number', default: 50000, min: 0, step: 1000 },
        { id: 'months', label: 'Months of coverage', type: 'number', default: 6, min: 1, max: 36, step: 1, suffix: 'mos' },
        { id: 'current', label: 'Current emergency savings', type: 'number', default: 100000, min: 0, step: 1000 }
      ],
      compute(v) {
        const target = v.expenses * v.months;
        const gap = Math.max(0, target - v.current);
        const coverage = v.expenses > 0 ? v.current / v.expenses : 0;
        return [
          { label: 'Emergency-fund target', value: target, format: 'currency', emphasis: 'neutral' },
          { label: 'Already saved', value: v.current, format: 'currency' },
          { label: 'Remaining gap', value: gap, format: 'currency', emphasis: gap > 0 ? 'negative' : 'positive' },
          { label: 'Current coverage', value: coverage, format: 'years' }
        ];
      }
    },
    'real-return': {
      id: 'real-return',
      title: 'Real Return Calculator',
      category: 'investment',
      short: 'See what an investment return looks like after inflation.',
      desc: 'Convert a nominal return and expected inflation rate into an inflation-adjusted real return.',
      fields: [
        { id: 'nominal', label: 'Nominal annual return', type: 'number', default: 10, min: -99, max: 1000, step: 0.1, suffix: '%' },
        { id: 'inflation', label: 'Annual inflation', type: 'number', default: 6, min: -99, max: 100, step: 0.1, suffix: '%' },
        { id: 'amount', label: 'Starting amount', type: 'number', default: 100000, min: 0, step: 1000 },
        { id: 'years', label: 'Time period', type: 'number', default: 10, min: 1, max: 100, step: 1, suffix: 'yrs' }
      ],
      compute(v) {
        const nominal = v.nominal / 100;
        const inflation = v.inflation / 100;
        const real = ((1 + nominal) / (1 + inflation) - 1) * 100;
        const futureNominal = v.amount * Math.pow(1 + nominal, v.years);
        const purchasingPower = futureNominal / Math.pow(1 + inflation, v.years);
        return [
          { label: 'Real annual return', value: real, format: 'percent', emphasis: real >= 0 ? 'positive' : 'negative' },
          { label: 'Nominal future value', value: futureNominal, format: 'currency' },
          { label: "Future value in today's purchasing power", value: purchasingPower, format: 'currency', emphasis: 'neutral' }
        ];
      }
    }
  };
  window.WA_EXTRA_CALCULATORS = extra;
})();