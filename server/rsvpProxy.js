import { createHmac } from "node:crypto";

const MAX_BODY_BYTES = 16_000;

export function sendJson(response, statusCode, payload) {
  response.statusCode = statusCode;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-store, max-age=0");
  response.end(JSON.stringify(payload));
}

export async function readJsonBody(request) {
  if (request.body !== undefined) {
    const bodyText =
      typeof request.body === "string"
        ? request.body
        : JSON.stringify(request.body);
    if (Buffer.byteLength(bodyText || "", "utf8") > MAX_BODY_BYTES) {
      const error = new Error("The RSVP request is too large.");
      error.statusCode = 413;
      throw error;
    }

    try {
      return typeof request.body === "string"
        ? JSON.parse(request.body || "{}")
        : request.body;
    } catch {
      const error = new Error("The RSVP request could not be read.");
      error.statusCode = 400;
      throw error;
    }
  }

  let rawBody = "";
  for await (const chunk of request) {
    rawBody += chunk;
    if (Buffer.byteLength(rawBody, "utf8") > MAX_BODY_BYTES) {
      const error = new Error("The RSVP request is too large.");
      error.statusCode = 413;
      throw error;
    }
  }

  try {
    return JSON.parse(rawBody || "{}");
  } catch {
    const error = new Error("The RSVP request could not be read.");
    error.statusCode = 400;
    throw error;
  }
}

function getClientIp(request) {
  const forwardedFor = request.headers["x-forwarded-for"];
  const ipFromProxy = Array.isArray(forwardedFor)
    ? forwardedFor[0]
    : forwardedFor?.split(",")[0];

  return (ipFromProxy || request.socket?.remoteAddress || "unknown")
    .trim()
    .slice(0, 128);
}

function statusForBackendCode(code) {
  if (code === "RATE_LIMITED") return 429;
  if (code === "CONFIGURATION") return 503;
  if (code === "BUSY") return 503;
  if (code === "UNAUTHORIZED") return 401;
  if (code === "SERVICE_ERROR") return 500;
  return 400;
}

export async function forwardRsvp(request, payload, environment) {
  const endpoint = environment.RSVP_APPS_SCRIPT_URL;
  const secret = environment.RSVP_PROXY_SECRET;

  if (!endpoint || !secret) {
    return {
      statusCode: 503,
      payload: {
        ok: false,
        code: "BACKEND_NOT_CONFIGURED",
        message:
          "RSVP submissions are not connected yet. Please try again later.",
      },
    };
  }

  let endpointUrl;
  try {
    endpointUrl = new URL(endpoint);
  } catch {
    return {
      statusCode: 503,
      payload: {
        ok: false,
        code: "BACKEND_CONFIGURATION",
        message: "The RSVP service is being configured. Please try again later.",
      },
    };
  }

  if (
    endpointUrl.protocol !== "https:" ||
    endpointUrl.hostname !== "script.google.com" ||
    !endpointUrl.pathname.includes("/macros/s/")
  ) {
    return {
      statusCode: 503,
      payload: {
        ok: false,
        code: "BACKEND_CONFIGURATION",
        message: "The RSVP service is being configured. Please try again later.",
      },
    };
  }

  const signedPayload = {
    requestId: payload?.requestId,
    guestNames: payload?.guestNames,
    attendance: payload?.attendance,
    message: payload?.message,
    website: payload?.website,
    sourceIp: getClientIp(request),
  };
  const canonicalBody = JSON.stringify(signedPayload);
  const signature = createHmac("sha256", secret)
    .update(canonicalBody, "utf8")
    .digest("hex");

  let backendResponse;
  try {
    backendResponse = await fetch(endpointUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json; charset=utf-8" },
      body: JSON.stringify({ ...signedPayload, signature }),
      redirect: "follow",
    });
  } catch {
    return {
      statusCode: 502,
      payload: {
        ok: false,
        code: "UPSTREAM_UNAVAILABLE",
        message: "We could not reach the RSVP service. Please try again.",
      },
    };
  }

  let backendPayload;
  try {
    backendPayload = await backendResponse.json();
  } catch {
    return {
      statusCode: 502,
      payload: {
        ok: false,
        code: "UPSTREAM_RESPONSE",
        message: "The RSVP service returned an unreadable response.",
      },
    };
  }

  if (backendPayload.ok) {
    return { statusCode: 200, payload: backendPayload };
  }

  return {
    statusCode: statusForBackendCode(backendPayload.code),
    payload: backendPayload,
  };
}
