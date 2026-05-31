import http from "http";
import app from "./app";
import { logger } from "./lib/logger";
import { initSocketIO } from "./lib/socketManager";
import { loadBibleData } from "./lib/bibleParser";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const httpServer = http.createServer(app);

// Attach Socket.IO to the HTTP server
initSocketIO(httpServer);

// Pre-load Bible data
loadBibleData().catch((err) => {
  logger.error({ err }, "Failed to pre-load Bible data");
});

httpServer.listen(port, () => {
  logger.info({ port }, "Server listening");
});
