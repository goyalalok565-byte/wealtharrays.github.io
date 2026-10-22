/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "gst",
    slug: "gst-calculator",
    title: "GST Calculator",
    category: "business",
    short: "Calculate GST and the invoice total from a pre-tax amount.",
    desc: "Add a GST rate to a taxable amount to estimate the tax component and total invoice value.",
    article: {
      formula: "GST amount = taxable amount × GST rate ÷ 100. Total invoice value = taxable amount + GST amount. This calculator adds tax to a pre-tax amount; it does not extract GST from a tax-inclusive price or decide which rate legally applies.",
      exampleInputs: { amount: 100000, rate: 18 },
      faqs: [
        { q: "Which GST rate should I use?", a: "Enter the rate that applies to your specific goods or services. Rates and classifications depend on the transaction and current rules." },
        { q: "Does this split CGST and SGST?", a: "No. It calculates the combined GST amount. Whether CGST/SGST or IGST applies depends on the transaction." }
      ]
    },
    fields: [
      { id: "amount", label: "Taxable amount (before GST)", type: "number", default: 100000, min: 0, max: 100000000000, step: 100 },
      { id: "rate", label: "GST rate", type: "number", default: 18, min: 0, max: 100, step: 0.1, suffix: "%" }
    ],
    compute(v) {
      const tax = v.amount * v.rate / 100;
      return [
        { label: "GST amount", value: tax, format: "currency", emphasis: "neutral" },
        { label: "Total including GST", value: v.amount + tax, format: "currency", emphasis: "positive" },
        { label: "Pre-tax amount", value: v.amount, format: "currency" }
      ];
    }
  });
