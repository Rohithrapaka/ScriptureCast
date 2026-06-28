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

// ── Single-service deployment ─────────────────────────────────────────────────
// In production the Express server serves the Vite-compiled frontend.
// The frontend build outputs to artifacts/scripture-cast/dist/public relative
// to the repo root (which is process.cwd() when started from there).
// In development this block is a no-op: the dist directory doesn't exist and
// Vite serves the frontend as a separate process on its own port.
const frontendDist = path.resolve(process.cwd(), "artifacts/scripture-cast/dist/public");

if (fs.existsSync(frontendDist)) {
  // Serve static assets (JS, CSS, fonts, images)
  app.use(express.static(frontendDist));

  // SPA fallback: any request not matched by /api/* or /socket.io/* serves
  // index.html so React Router can handle client-side navigation.
  // Express 5 requires named wildcards; "/{*path}" matches everything.
  app.get("/{*path}", (_req, res) => {
    res.sendFile(path.join(frontendDist, "index.html"));
  });

  logger.info({ frontendDist }, "Serving frontend static files");
}

export default app;
