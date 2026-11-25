import { createHmac } from "node:crypto";

const MAX_BODY_BYTES = 16_000;
const UUID_V4_PATTERN =
  /^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;

export function validateRsvpPayload(payload) {
  if (!payload || typeof payload !== "object" || Array.isArray(payload)) {
    throw requestError_("The RSVP request must be a JSON object.");
  }

  const allowedKeys = new Set([
    "requestId",
    "guestNames",
    "attendance",
    "message",
    "website",
  ]);
  if (Object.keys(payload).some((key) => !allowedKeys.has(key))) {
    throw requestError_("The RSVP request contains an unexpected field.");
  }

  if (typeof payload.website !== "string" || payload.website.length > 200) {
    throw requestError_("The RSVP request could not be verified.");
  }

  if (payload.website.trim()) {
    return { honeypot: true };
  }

  if (
    typeof payload.requestId !== "string" ||
    !UUID_V4_PATTERN.test(payload.requestId)
  ) {
    throw requestError_("Please refresh the page and try again.");
  }

  if (
    !Array.isArray(payload.guestNames) ||
    payload.guestNames.length < 1 ||
    payload.guestNames.length > 5
  ) {
    throw requestError_("Choose between one and five guests.");
  }

  const guestNames = payload.guestNames.map((name) => {
    if (typeof name !== "string") {
      throw requestError_("Enter a full name for each guest.");
    }

    const normalizedName = name.trim().replace(/\s+/g, " ");
    if (normalizedName.length < 1 || normalizedName.length > 100) {
      throw requestError_("Each guest name must be 1 to 100 characters.");
    }
    return normalizedName;
  });

  const uniqueNames = new Set(guestNames.map((name) => name.toLocaleLowerCase()));
  if (uniqueNames.size !== guestNames.length) {
    throw requestError_("Please remove duplicate guest names.");
  }

  if (!["accept", "decline"].includes(payload.attendance)) {
    throw requestError_("Choose an attendance response.");
  }

  if (typeof payload.message !== "string" || payload.message.length > 500) {
    throw requestError_("The message must be 500 characters or fewer.");
  }

  return {
    requestId: payload.requestId,
    guestNames,
    attendance: payload.attendance,
    message: payload.message.trim(),
    website: "",
  };
}

export function isAllowedRsvpOrigin(request, configuredOrigins = "") {
  const origin = request.headers?.origin;
  const requestHost = request.headers?.host?.toLowerCase();
  if (!origin || !requestHost) return false;

  let originUrl;
  try {
    originUrl = new URL(origin);
  } catch {
    return false;
  }

  const isLocalDevelopment = ["localhost", "127.0.0.1"].includes(
    originUrl.hostname,
  );
  if (!isLocalDevelopment && originUrl.protocol !== "https:") return false;
  if (originUrl.host.toLowerCase() !== requestHost) return false;

  const allowedOrigins = configuredOrigins
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);

  return (
    allowedOrigins.length === 0 || allowedOrigins.includes(originUrl.origin)
  );
}

function requestError_(message) {
  const error = new Error(message);
  error.statusCode = 400;
  return error;
}

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
