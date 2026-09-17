/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "profit-margin",
    slug: "profit-margin-calculator",
    title: "Profit Margin",
    category: "business",
    short: "Find gross and net margin from revenue and costs.",
    desc: "Calculate gross margin (revenue minus cost of goods) and net margin (after all expenses) as percentages of revenue.",
    article: {
      formula: "Gross margin = (Revenue − Cost of goods sold) ÷ Revenue × 100. Net margin = (Revenue − Cost of goods sold − Other expenses) ÷ Revenue × 100.",
      exampleInputs: { revenue: 50000, cogs: 28000, expenses: 9000 },
      faqs: [
        { q: "What's the difference between gross and net margin?", a: "Gross margin only subtracts the direct cost of producing what you sold. Net margin also subtracts everything else — rent, salaries, marketing, and other operating expenses — giving a fuller picture of profitability." },
        { q: "What's a 'good' profit margin?", a: "It varies enormously by industry — grocery retail often runs on margins under 5%, while software businesses can see 70%+ gross margins. Compare against others in your specific industry rather than a universal benchmark." },
        { q: "How can I improve my margin?", a: "Broadly: raise prices, reduce the cost of goods sold, or cut operating expenses — each has trade-offs specific to your business that this calculator can't account for." },
      ],
    },
    fields: [
      { id: "revenue", label: "Revenue", type: "number", default: 50000, min: 0, step: 100 },
      { id: "cogs", label: "Cost of goods sold", type: "number", default: 28000, min: 0, step: 100 },
      { id: "expenses", label: "Other operating expenses", type: "number", default: 9000, min: 0, step: 100 },
    ],
    compute(v) {
      const grossProfit = v.revenue - v.cogs;
      const netProfit = grossProfit - v.expenses;
      const grossMargin = v.revenue === 0 ? 0 : (grossProfit / v.revenue) * 100;
      const netMargin = v.revenue === 0 ? 0 : (netProfit / v.revenue) * 100;
      return [
        { label: "Gross profit", value: grossProfit, format: "currency" },
        { label: "Gross margin", value: grossMargin, format: "percent", emphasis: "neutral" },
        { label: "Net profit", value: netProfit, format: "currency", emphasis: netProfit >= 0 ? "positive" : "negative" },
        { label: "Net margin", value: netMargin, format: "percent", emphasis: netProfit >= 0 ? "positive" : "negative" },
      ];
    },
  });
