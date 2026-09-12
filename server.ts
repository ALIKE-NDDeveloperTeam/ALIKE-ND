import dotenv from "dotenv";
dotenv.config({ override: true });
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import express from "express";
import app from "./backend/app";

// Safe process-level safety handlers to prevent rollout crashes
process.on("unhandledRejection", (reason, promise) => {
  console.warn("⚠️ [UNHANDLED REJECTION]:", reason);
});

process.on("uncaughtException", (error) => {
  console.error("💥 [UNCAUGHT EXCEPTION]:", error);
});

process.on("SIGTERM", () => {
  console.log("🛑 [SIGTERM] Shutting down gracefully...");
  process.exit(0);
});

process.on("SIGINT", () => {
  console.log("🛑 [SIGINT] Shutting down gracefully...");
  process.exit(0);
});

// Safe __dirname resolution across ESM (tsx) and CJS (dist bundle)
const getDirname = () => {
  try {
    if (typeof import.meta !== "undefined" && import.meta.url) {
      return path.dirname(fileURLToPath(import.meta.url));
    }
  } catch (_e) {
    // Fallback
  }
  return typeof __dirname !== "undefined" ? __dirname : process.cwd();
};

async function startServer() {
  const currentDir = getDirname();

  // In development, tsx runs server.ts from the workspace root.
  // In production (Cloud Run rollout), the bundled dist/server.cjs runs.
  const isProduction =
    process.env.NODE_ENV === "production" ||
    (typeof __dirname !== "undefined" && __dirname.endsWith("dist"));

  if (!isProduction) {
    // Development mode: load Vite middleware for on-the-fly TSX compilation
    const { createServer: createViteServer } = await import("vite");
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    // Production mode: locate built assets reliably across diverse working directories
    const candidatePaths = [
      currentDir,
      path.join(currentDir, "dist"),
      path.join(process.cwd(), "dist"),
      process.cwd(),
    ];

    const distPath =
      candidatePaths.find((p) => fs.existsSync(path.join(p, "index.html"))) ||
      path.join(process.cwd(), "dist");

    console.log(`[PRODUCTION SERVER] Serving static files from: ${distPath}`);
    app.use(express.static(distPath));

    app.get("*", (_req, res) => {
      const indexPath = path.join(distPath, "index.html");
      if (fs.existsSync(indexPath)) {
        res.sendFile(indexPath);
      } else {
        res.status(200).send("Alikendshop App running");
      }
    });
  }

  // PORT RESOLUTION:
  // In development, the container's nginx proxy routes externally exclusively to port 3000.
  // In production Cloud Run rollout, Cloud Run injects process.env.PORT (typically 8080)
  // and directs container health checks / traffic to that port.
  const targetPort = isProduction
    ? Number(process.env.PORT) || 8080
    : 3000;

  const server = app.listen(targetPort, "0.0.0.0", () => {
    console.log(
      `🚀 [SERVER RUNNING] Listening on 0.0.0.0:${targetPort} (${isProduction ? "production / Cloud Run" : "development / sandbox"})`
    );
  });

  server.on("error", (err: any) => {
    console.error(`Primary listener error on port ${targetPort}:`, err);
  });

  // In production, if targetPort is not 3000, also bind a listener to 3000
  // to ensure compatibility with any proxy or probe testing port 3000.
  if (isProduction && targetPort !== 3000) {
    try {
      const fallbackServer = app.listen(3000, "0.0.0.0", () => {
        console.log(`🚀 [FALLBACK LISTENER] Also listening on 0.0.0.0:3000`);
      });
      fallbackServer.on("error", (err: any) => {
        console.log(`Port 3000 listener notice: ${err?.message || err}`);
      });
    } catch (_e) {}
  }
}

startServer().catch((err) => {
  console.error("Failed to start server", err);
});



