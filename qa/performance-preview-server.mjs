import { createServer } from "node:http";
import fs from "node:fs";
import path from "node:path";
import { brotliCompressSync, gzipSync, constants as zlibConstants } from "node:zlib";

const option = name => {
  const index = process.argv.indexOf(name);
  return index >= 0 ? process.argv[index + 1] : undefined;
};
const root = path.resolve(option("--root") || "dist");
const port = Number(option("--port") || process.env.PORT || 4173);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error("Invalid preview port.");
if (!fs.existsSync(root) || !fs.statSync(root).isDirectory()) throw new Error("Preview root does not exist: " + root);

const mime = new Map([
  [".html", "text/html; charset=utf-8"], [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"], [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"], [".xml", "application/xml; charset=utf-8"],
  [".txt", "text/plain; charset=utf-8"], [".svg", "image/svg+xml"],
  [".webmanifest", "application/manifest+json"], [".woff", "font/woff"],
  [".woff2", "font/woff2"], [".png", "image/png"], [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"], [".webp", "image/webp"], [".ico", "image/x-icon"]
]);
const compressible = type => /^(text\/|application\/(javascript|json|xml|manifest\+json)|image\/svg\+xml)/i.test(type);
function acceptedEncoding(header, wanted) {
  return String(header || "").split(",").some(part => {
    const [name, ...params] = part.trim().toLowerCase().split(";");
    const quality = params.find(value => value.trim().startsWith("q="));
    return name === wanted && (!quality || Number(quality.trim().slice(2)) > 0);
  });
}
function send(res, status, body, headers = {}, head = false) {
  res.writeHead(status, headers);
  res.end(head ? undefined : body);
}

const server = createServer((req, res) => {
  if (req.method !== "GET" && req.method !== "HEAD") {
    return send(res, 405, "Method not allowed", { "Content-Type": "text/plain; charset=utf-8", Allow: "GET, HEAD" }, req.method === "HEAD");
  }
  let pathname;
  try { pathname = decodeURIComponent(new URL(req.url || "/", "http://127.0.0.1").pathname); }
  catch { return send(res, 400, "Bad request", { "Content-Type": "text/plain; charset=utf-8" }, req.method === "HEAD"); }
  const filePath = path.resolve(root, "." + pathname);
  const relative = path.relative(root, filePath);
  if (relative === ".." || relative.startsWith(".." + path.sep) || path.isAbsolute(relative)) {
    return send(res, 403, "Forbidden", { "Content-Type": "text/plain; charset=utf-8" }, req.method === "HEAD");
  }
  try {
    let target = filePath;
    if (fs.statSync(target).isDirectory()) target = path.join(target, "index.html");
    if (!fs.statSync(target).isFile()) throw new Error("Not a file");
    const raw = fs.readFileSync(target);
    const type = mime.get(path.extname(target).toLowerCase()) || "application/octet-stream";
    const headers = {
      "Content-Type": type,
      "Content-Length": raw.length,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "no-store"
    };
    let body = raw;
    if (compressible(type)) {
      headers.Vary = "Accept-Encoding";
      if (acceptedEncoding(req.headers["accept-encoding"], "br")) {
        body = brotliCompressSync(raw, { params: { [zlibConstants.BROTLI_PARAM_QUALITY]: 4 } });
        headers["Content-Encoding"] = "br";
      } else if (acceptedEncoding(req.headers["accept-encoding"], "gzip")) {
        body = gzipSync(raw);
        headers["Content-Encoding"] = "gzip";
      }
      headers["Content-Length"] = body.length;
    }
    return send(res, 200, body, headers, req.method === "HEAD");
  } catch {
    return send(res, 404, "Not found", { "Content-Type": "text/plain; charset=utf-8" }, req.method === "HEAD");
  }
});
server.listen(port, "127.0.0.1", () => {
  console.log("Brotli-capable performance preview serving " + root + " at http://127.0.0.1:" + port);
});
