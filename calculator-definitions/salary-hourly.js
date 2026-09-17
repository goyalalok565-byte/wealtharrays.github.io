/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "salary-hourly",
    slug: "salary-to-hourly-calculator",
    title: "Salary ↔ Hourly",
    category: "salary",
    short: "Convert between an annual salary and an hourly rate.",
    desc: "Switch either direction — see what an annual salary works out to per hour, or what an hourly rate adds up to per year.",
    article: {
      formula: "Hourly rate = Annual salary ÷ (Hours per week × Working weeks per year). To go the other way: Annual salary = Hourly rate × Hours per week × Working weeks per year.",
      exampleInputs: { direction: "toHourly", amount: 60000, hoursPerWeek: 40, weeksPerYear: 48 },
      faqs: [
        { q: "Why 48 weeks and not 52?", a: "52 weeks minus a typical 2–4 weeks of unpaid time off (holidays, sick days not covered by salary) gives a more realistic working-weeks figure. Adjust it to match your actual situation — salaried roles with full paid leave might use 52." },
        { q: "Does this include overtime?", a: "No — this is a straight-line conversion based on regular hours. If you regularly work overtime, your effective hourly rate for salaried work will be lower than shown here." },
        { q: "Are taxes included?", a: "No, both figures are gross (pre-tax) amounts." },
      ],
    },
    fields: [
      {
        id: "direction", label: "Convert", type: "select", default: "toHourly",
        options: [
          { value: "toHourly", label: "Salary → Hourly" },
          { value: "toSalary", label: "Hourly → Salary" },
        ],
      },
      { id: "amount", label: "Amount", type: "number", default: 60000, min: 0, step: 100 },
      { id: "hoursPerWeek", label: "Hours per week", type: "number", default: 40, min: 1, max: 100, step: 1 },
      { id: "weeksPerYear", label: "Working weeks per year", type: "number", default: 48, min: 1, max: 52, step: 1 },
    ],
    compute(v) {
      const totalHours = v.hoursPerWeek * v.weeksPerYear;
      if (v.direction === "toHourly") {
        const hourly = totalHours === 0 ? 0 : v.amount / totalHours;
        return [
          { label: "Working hours / year", value: totalHours, format: "number" },
          { label: "Hourly rate", value: hourly, format: "currency", emphasis: "neutral" },
        ];
      } else {
        const annual = v.amount * totalHours;
        return [
          { label: "Working hours / year", value: totalHours, format: "number" },
          { label: "Annual salary", value: annual, format: "currency", emphasis: "neutral" },
        ];
      }
    },
  });
