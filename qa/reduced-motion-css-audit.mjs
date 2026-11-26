import { readFile } from "node:fs/promises";

const files = ["styles.css", "phase4-premium.css"];
for (const file of files) {
  const css = await readFile(new URL(`../${file}`, import.meta.url), "utf8");
  if (/NaNs/i.test(css)) throw new Error(`${file}: invalid NaN duration found in CSS`);
  if (!css.includes("prefers-reduced-motion:reduce")) throw new Error(`${file}: reduced-motion media query missing`);
  if (!css.includes("animation-duration:0.01ms!important")) throw new Error(`${file}: reduced-motion animation duration is not safely minimized`);
  if (!css.includes("transition-duration:0.01ms!important")) throw new Error(`${file}: reduced-motion transition duration is not safely minimized`);
}
console.log("Reduced-motion CSS audit passed for styles.css and phase4-premium.css.");
