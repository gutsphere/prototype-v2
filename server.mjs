import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { createServer } from "node:http";
import { extname, join, normalize, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const projectRoot = fileURLToPath(new URL(".", import.meta.url));
const publicRoot = resolve(projectRoot);
const port = Number.parseInt(process.env.PORT || "4173", 10);

const contentTypes = {
  ".css": "text/css; charset=utf-8",
  ".html": "text/html; charset=utf-8",
  ".ico": "image/x-icon",
  ".jpeg": "image/jpeg",
  ".jpg": "image/jpeg",
  ".js": "text/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".webp": "image/webp"
};

function safePath(urlPath) {
  const decoded = decodeURIComponent(urlPath.split("?")[0]);
  const normalized = normalize(decoded).replace(/^([/\\])+/, "");
  const candidate = resolve(publicRoot, normalized);
  return candidate === publicRoot || candidate.startsWith(`${publicRoot}${sep}`)
    ? candidate
    : null;
}

async function resolveFile(urlPath) {
  const candidate = safePath(urlPath);
  if (!candidate) return null;

  try {
    const info = await stat(candidate);
    if (info.isDirectory()) return join(candidate, "index.html");
    if (info.isFile()) return candidate;
  } catch {
    return null;
  }

  return null;
}

const server = createServer(async (request, response) => {
  try {
    const requestUrl = new URL(request.url || "/", `http://${request.headers.host || "localhost"}`);
    const filePath = await resolveFile(requestUrl.pathname);

    if (!filePath) {
      response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
      response.end("Page not found");
      return;
    }

    const type = contentTypes[extname(filePath).toLowerCase()] || "application/octet-stream";
    response.writeHead(200, {
      "Cache-Control": "no-cache",
      "Content-Type": type
    });
    createReadStream(filePath).pipe(response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Unable to load the prototype");
    console.error(error);
  }
});

server.listen(port, "127.0.0.1", () => {
  console.log(`Gutsphere Demo v2 is running at http://127.0.0.1:${port}`);
});
