import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import type { ViteDevServer } from "vite";

function flayApiDevPlugin() {
  return {
    name: "flay-api-dev-plugin",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(async (req, res, next) => {
        const requestUrl = req.url || "";
        if (!requestUrl.startsWith("/api/flay")) {
          next();
          return;
        }

        try {
          const path = requestUrl.split("?")[0] || "";
          const modulePath = /^\/api\/flay\/[^/]+$/.test(path)
            ? "/api/flay/[id].ts"
            : "/api/flay/index.ts";

          const mod = await server.ssrLoadModule(modulePath);
          const handler = mod?.default;
          if (typeof handler !== "function") {
            throw new Error(`No default handler exported from ${modulePath}`);
          }

          await handler(req, res);
          if (!res.writableEnded) {
            next();
          }
        } catch (error: any) {
          if (!res.headersSent) {
            res.statusCode = 500;
            res.setHeader("Content-Type", "application/json; charset=utf-8");
          }
          res.end(
            JSON.stringify({
              error: "Dev API handler failed.",
              detail: error?.message || "Unknown error",
            }),
          );
        }
      });
    },
  };
}

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss(), flayApiDevPlugin()],
});
