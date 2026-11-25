import {
  forwardRsvp,
  isAllowedRsvpOrigin,
  readJsonBody,
  sendJson,
  validateRsvpPayload,
} from "../server/rsvpProxy.js";

export default async function handler(request, response) {
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

  if (!isAllowedRsvpOrigin(request, process.env.RSVP_ALLOWED_ORIGINS)) {
    sendJson(response, 403, {
      ok: false,
      code: "ORIGIN_NOT_ALLOWED",
      message: "This RSVP request did not come from the invitation website.",
    });
    return;
  }

  try {
    const payload = validateRsvpPayload(await readJsonBody(request));
    if (payload.honeypot) {
      sendJson(response, 200, {
        ok: true,
        message: "Your RSVP has been received.",
      });
      return;
    }

    const result = await forwardRsvp(request, payload, process.env);
    sendJson(response, result.statusCode, result.payload);
  } catch (error) {
    sendJson(response, error.statusCode || 400, {
      ok: false,
      code: "INVALID_REQUEST",
      message: error.message || "The RSVP request could not be processed.",
    });
  }
}
