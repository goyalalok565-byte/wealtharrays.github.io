/* Generated from calculators.js — do not edit directly. */
window.CALCULATORS=window.CALCULATORS||[];window.CALCULATORS.push({
    id: "gst",
    slug: "gst-calculator",
    title: "GST Calculator",
    category: "business",
    short: "Calculate GST and the invoice total from a pre-tax amount.",
    desc: "Add a GST rate to a taxable amount to estimate the tax component and total invoice value.",
    article: {
      formula: "For an exclusive amount, GST = amount × rate ÷ 100. For an inclusive amount, taxable base = total ÷ (1 + rate ÷ 100), and GST = total − taxable base. The tool does not decide which rate legally applies.",
      exampleInputs: { amount: 100000, rate: 18, mode: 'exclusive' },
      faqs: [
        { q: "Which GST rate should I use?", a: "Enter the rate that applies to your specific goods or services. Rates and classifications depend on the transaction and current rules." },
        { q: "Does this split CGST and SGST?", a: "No. It calculates the combined GST amount. Whether CGST/SGST or IGST applies depends on the transaction." }
      ]
    },
    fields: [
      { id: "amount", label: "Amount", type: "number", default: 100000, min: 0, max: 100000000000, step: 100 },
      { id: "rate", label: "GST rate", type: "number", default: 18, min: 0, max: 100, step: 0.1, suffix: "%" },
      { id: "mode", label: "Amount includes GST?", type: "select", default: "exclusive", options: [{ value: "exclusive", label: "No — add GST to the amount" }, { value: "inclusive", label: "Yes — extract GST from the total" }] }
    ],
    compute(v) {
      const base = v.mode === "inclusive" ? v.amount / (1 + v.rate / 100) : v.amount;
      const tax = v.mode === "inclusive" ? v.amount - base : base * v.rate / 100;
      return [
        { label: "GST amount", value: tax, format: "currency", emphasis: "neutral" },
        { label: "Total including GST", value: base + tax, format: "currency", emphasis: "positive" },
        { label: "Pre-tax amount", value: base, format: "currency" }
      ];
    }
  });
