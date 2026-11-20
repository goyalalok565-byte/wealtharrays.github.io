export const EXCLUDED_DIRECTORY_NAMES = new Set([
  ".git", ".github", ".wrangler", ".cache", ".turbo", ".next", ".vercel",
  "node_modules", "qa", "scripts", "docs", "tests", "test", "__tests__",
  "coverage", "artifacts", "backups", "backup", "archives", "archive",
  "country-modules", "api", "p", "privacy", "reports", "dist"
]);
const FORBIDDEN_EXTENSIONS = new Set([
  ".md", ".zip", ".7z", ".rar", ".tar", ".gz", ".bak", ".backup",
  ".old", ".orig", ".tmp", ".log", ".map"
]);
const FORBIDDEN_FILES = new Set(["content-sources.json", "package.json", "package-lock.json", "wrangler.toml"]);

export function isForbiddenDeploymentPath(relativePath) {
  const normalized = String(relativePath).replaceAll("\\", "/").replace(/^\.\//, "");
  const segments = normalized.split("/").filter(Boolean);
  if (segments.some(segment => EXCLUDED_DIRECTORY_NAMES.has(segment))) return true;
  const basename = segments.at(-1) || "";
  if (FORBIDDEN_FILES.has(basename)) return true;
  const extension = basename.includes(".") ? "." + basename.split(".").at(-1).toLowerCase() : "";
  return FORBIDDEN_EXTENSIONS.has(extension);
}
