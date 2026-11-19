/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "break-even",
    slug: "break-even-calculator",
    title: "Break-Even Calculator",
    category: "business",
    short: "Find how many units you must sell to cover fixed costs and reach a profit target.",
    desc: "Find the break-even units and sales value from fixed costs, selling price and variable cost, plus units needed for a profit target.",
    article: {
      formula: "Contribution per unit = selling price − variable cost per unit. Break-even units = fixed costs ÷ contribution per unit, rounded up to a whole unit. Break-even sales = break-even units × selling price. Units for a profit target = (fixed costs + target profit) ÷ contribution per unit. If the selling price does not exceed the variable cost, no sales volume can cover the fixed costs.",
      exampleInputs: { fixedCosts: 150000, price: 150, variableCost: 60, targetProfit: 50000, days: 30 },
      faqs: [
        { q: "What are fixed and variable costs?", a: "Fixed costs such as rent, salaries and licences stay the same however much you sell in a month. Variable costs such as ingredients and packaging rise with every unit sold." },
        { q: "Why does the answer say there is no break-even?", a: "That happens when the selling price is equal to or below the variable cost. Each sale then loses money or adds nothing, so more sales never cover the fixed costs. Raise the price or cut the variable cost." },
        { q: "Can I use it for a service business?", a: "Yes. Treat one billable hour, one job or one order as a unit, use the average price per unit, and enter the direct cost of delivering that unit as the variable cost." }
      ]
    },
    fields: [
      { id: "fixedCosts", label: "Fixed costs per month", type: "number", default: 150000, min: 0, max: 100000000000, step: 1000 },
      { id: "price", label: "Selling price per unit", type: "number", default: 150, min: 0, max: 1000000000, step: 1 },
      { id: "variableCost", label: "Variable cost per unit", type: "number", default: 60, min: 0, max: 1000000000, step: 1 },
      { id: "targetProfit", label: "Target monthly profit", type: "number", default: 50000, min: 0, max: 100000000000, step: 1000 },
      { id: "days", label: "Days open per month", type: "number", default: 30, min: 1, max: 31, step: 1, suffix: "days" }
    ],
    compute(v) {
      const fixed = Math.max(0, Number(v.fixedCosts) || 0);
      const price = Math.max(0, Number(v.price) || 0);
      const variable = Math.max(0, Number(v.variableCost) || 0);
      const target = Math.max(0, Number(v.targetProfit) || 0);
      const days = Math.max(1, Number(v.days) || 1);
      const contribution = price - variable;
      const viable = contribution > 0;
      const units = viable ? Math.ceil(fixed / contribution) : 0;
      const targetUnits = viable ? Math.ceil((fixed + target) / contribution) : 0;
      return [
        { label: "Contribution per unit", value: contribution, format: "currency", emphasis: viable ? "positive" : "negative" },
        { label: viable ? "Break-even units per month" : "No break-even: price does not cover variable cost", value: units, format: "number", emphasis: viable ? "neutral" : "negative" },
        { label: "Break-even sales per month", value: units * price, format: "currency" },
        { label: "Break-even units per day", value: units / days, format: "number" },
        { label: "Units per month for the profit target", value: targetUnits, format: "number", emphasis: "positive" }
      ];
    }
  });
