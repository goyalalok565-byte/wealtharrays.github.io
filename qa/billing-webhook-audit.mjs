import assert from "node:assert/strict";
import fs from "node:fs";

const source = fs.readFileSync("functions/v1/billing/webhook.js", "utf8")
  .replace(/^import \{ error, json \} from "\.\.\/_shared\.js";\n/, 