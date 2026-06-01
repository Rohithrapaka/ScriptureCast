import express, { type Express } from "express";
import cors from "cors";
import pinoHttp from "pino-http";
import path from "path";
import fs from "fs";
import router from "./routes";
import { logger } from "./lib/logger";

const app: Express = express();

app.use(
  pinoHttp({
    logger,
    serializers: {
      req(req) {
        return {
          id: req.id,
          method: req.method,
          url: req.url?.split("?")[0],
        };
      },
      res(res) {
        return {
          statusCode: res.statusCode,
        };
      },
    },
  }),
);
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use("/api", router);

// Single-service deployment: serve the Vite-built frontend from Express.
// The frontend is built to artifacts/scripture-cast/dist/public (relative to
// the repo root).  In production the process starts from the repo root, so
// the path resolves correctly.  This block is a no-op when the directory
// doesn't exist (i.e. in development, where Vite runs as a separate service).
const frontendDist = path.resolve(process.cwd(), "artifacts/scripture-cast/dist/public");
if (fs.existsSync(frontendDist)) {
  app.use(express.static(frontendDist));
  // SPA fallback: any request that isn't /api or /socket.io gets index.html
  app.get("*", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });
  logger.info({ frontendDist }, "Serving frontend static files");
}

export default app;
