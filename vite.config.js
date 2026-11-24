import { defineConfig, loadEnv } from "vite";
import react from "@vitejs/plugin-react";
import {
  forwardRsvp,
  readJsonBody,
  sendJson,
} from "./server/rsvpProxy.js";

function localRsvpApi(environment) {
  return {
    name: "local-rsvp-api",
    configureServer(server) {
      server.middlewares.use(async (request, response, next) => {
        const requestUrl = new URL(request.url || "/", "http://localhost");
        if (requestUrl.pathname !== "/api/rsvp") {
          next();
          return;
        }

        if (request.method !== "POST") {
          response.setHeader("Allow", "POST");
          sendJson(response, 405, {
            ok: false,
            code: "METHOD_NOT_ALLOWED",
            message: "Use POST to send an RSVP.",
          });
          return;
        }

        const contentType = request.headers["content-type"] || "";
        if (!contentType.toLowerCase().startsWith("application/json")) {
          sendJson(response, 415, {
            ok: false,
            code: "UNSUPPORTED_MEDIA_TYPE",
            message: "The RSVP request must be sent as JSON.",
          });
          return;
        }

        const origin = request.headers.origin;
        const requestHost = request.headers.host;
        if (origin && requestHost) {
          try {
            if (new URL(origin).host !== requestHost) {
              sendJson(response, 403, {
                ok: false,
                code: "ORIGIN_NOT_ALLOWED",
                message:
                  "This RSVP request did not come from the invitation website.",
              });
              return;
            }
          } catch {
            sendJson(response, 403, {
              ok: false,
              code: "ORIGIN_NOT_ALLOWED",
              message:
                "This RSVP request did not come from the invitation website.",
            });
            return;
          }
        }

        try {
          const payload = await readJsonBody(request);
          const result = await forwardRsvp(request, payload, environment);
          sendJson(response, result.statusCode, result.payload);
        } catch (error) {
          sendJson(response, error.statusCode || 400, {
            ok: false,
            code: "INVALID_REQUEST",
            message: error.message || "The RSVP request could not be processed.",
          });
        }
      });
    },
  };
}

export default defineConfig(({ mode }) => {
  const environment = loadEnv(mode, process.cwd(), "");

  return {
    plugins: [react(), localRsvpApi(environment)],
    base: "/",
  };
});
