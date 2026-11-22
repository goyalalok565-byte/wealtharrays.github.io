import assert from "node:assert/strict";
import fs from "node:fs";

const pages = [
  ["cagr", "cagr-calculator"],
  ["car-loan", "car-loan-calculator"],
  ["debt-payoff", "debt-payoff-calculator"],
  ["fixed-deposit", "fixed-deposit-calculator"],
  ["freelance-rate", "freelance-rate-calculator"],
  ["income-tax-planner", "income-tax-planner"],
  ["inflation", "inflation-calculator"],
  ["lumpsum", "lumpsum-calculator"],
  ["net-worth", "net-worth-calculator"],
  ["overtime-pay", "overtime-pay-calculator"],
  ["personal-loan", "personal-loan-calculator"],
  ["recurring-deposit", "recurring-deposit-calculator"]
];

assert.ok(fs.existsSync("og-image.png"), "Shared PNG Open Graph asset must exist");
for (const [draft, route] of pages) {
  const draftPath = `docs/content-drafts/${draft}.md`;
  const pagePath = `${route}/index.html`;
  assert.ok(fs.existsSync(draftPath), `Missing content draft: ${draftPath}`);
  assert.ok(fs.existsSync(pagePath), `Missing calculator page: ${pagePath}`);
  const html = fs.readFileSync(pagePath, "utf8");
  const faqCount = (html.match(/class="faq-item"/g) || []).length;
  assert.ok(faqCount >= 5, `${route} must publish at least five FAQs (found ${faqCount})`);
  assert.ok(html.includes("og-image.png") && html.includes('property="og:image:type" content="image/png"'), `${route} must use PNG Open Graph metadata`);
  assert.ok(html.includes('hreflang="en"') && html.includes('hreflang="x-default"'), `${route} must declare English and x-default hreflang`);
  assert.ok(html.includes("Last updated: 22 November 2026"), `${route} must show its last-updated date`);
  assert.ok(html.includes("Official references"), `${route} must publish official references`);
  assert.ok(html.includes("Common mistakes to avoid"), `${route} must publish common mistakes`);
  assert.ok((html.match(/class="worked-example"/g) || []).length >= 2, `${route} must include multiple worked-example sections`);
  const sourceSection = html.split("Official references").slice(-1)[0].split("</section>")[0];
  assert.ok((sourceSection.match(/https:\/\//g) || []).length >= 3, `${route} must cite at least three HTTPS references`);
}
console.log(`Content draft audit PASS — ${pages.length} pages have 5+ FAQs, worked examples, official sources, last-updated dates, PNG OG metadata and hreflang.`);
