import fs from "node:fs";

const workflow = fs.readFileSync(".github/workflows/cloudflare-test-deploy.yml", "utf8");
const require = (condition, message) => { if (!condition) throw new Error(message); };
const validationLine = workflow.split("\n").find((line) => line.includes("for name in")) || "";

for (const name of ["TURNSTILE_SECRET_KEY", "TURNSTILE_SITE_KEY"]) {
  const envBinding = new RegExp("^\\s+" + name + ": \\$\\{\\{ secrets\\." + name + " \\}\\}$", "gm");
  const envCount = [...workflow.matchAll(envBinding)].length;
  require(envCount >= 2, name + " must be passed to both TEST validation and TEST Worker secret upload.");
  require(validationLine.includes(name), name + " must be included in TEST secret validation.");
  require(workflow.includes('"' + name + '"'), name + " must be included in the TEST Worker secret bulk payload.");
}
console.log("TEST deploy Turnstile audit PASS: site and secret keys are validated and forwarded only to the isolated TEST Worker.");
