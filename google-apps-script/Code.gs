const RSVP_CONFIG = {
  spreadsheetId: "15QxAqlSeZLoBa06Tcbi-7lV7wK3kdGkOAkyU60tayCg",
  sheetId: 0,
  timeZone: "Asia/Manila",
  rateLimitCount: 20,
  rateLimitSeconds: 60 * 60,
  headers: ["Timestamp", "Full Name", "Attendance", "Submission ID"],
};

/** Run once from the Apps Script editor to grant access to the target sheet. */
function authorizeSpreadsheetAccess() {
  const sheet = SpreadsheetApp.openById(RSVP_CONFIG.spreadsheetId)
    .getSheets()
    .filter(function (candidate) {
      return candidate.getSheetId() === RSVP_CONFIG.sheetId;
    })[0];

  if (!sheet) {
    throw new Error("The response tab with sheet ID 0 could not be found.");
  }
}

/** Receives one signed RSVP request and writes one row per invited guest. */
function doPost(event) {
  try {
    const rawBody = event && event.postData && event.postData.contents;
    if (!rawBody) {
      return jsonResponse_({
        ok: false,
        code: "INVALID_REQUEST",
        message: "The RSVP request is empty.",
      });
    }

    let payload;
    try {
      payload = JSON.parse(rawBody);
    } catch (error) {
      return jsonResponse_({
        ok: false,
        code: "INVALID_REQUEST",
        message: "The RSVP request could not be read.",
      });
    }

    const secret = PropertiesService.getScriptProperties().getProperty(
      "RSVP_PROXY_SECRET",
    );
    if (!secret || !isValidProxySignature_(payload, secret)) {
      return jsonResponse_({
        ok: false,
        code: "UNAUTHORIZED",
        message: "This RSVP request could not be verified.",
      });
    }

    if (typeof payload.website === "string" && payload.website.trim()) {
      // Silently accept the honeypot so automated form fillers do not learn
      // which protection stopped the request. No sheet row is written.
      return jsonResponse_({ ok: true, message: "RSVP received." });
    }

    const request = validateRsvp_(payload);
    const submissionId = createSubmissionId_(request.requestId, secret);
    const lock = LockService.getScriptLock();

    if (!lock.tryLock(10000)) {
      return jsonResponse_({
        ok: false,
        code: "BUSY",
        message: "The RSVP service is busy. Please try again shortly.",
      });
    }

    try {
      const sheet = getTargetSheet_();
      const columns = ensureHeaders_(sheet);

      if (submissionExists_(sheet, columns.submissionId, submissionId)) {
        return jsonResponse_({
          ok: true,
          duplicate: true,
          submissionId: submissionId,
          guestCount: request.guestNames.length,
          message: "Your RSVP has already been received.",
        });
      }

      enforceRateLimit_(request.sourceIp);

      const now = Utilities.formatDate(
        new Date(),
        RSVP_CONFIG.timeZone,
        "MM/dd/yyyy HH:mm",
      );
      const attendance =
        request.attendance === "accept" ? "Attending" : "Declined";
      const columnCount = Math.max(sheet.getLastColumn(), RSVP_CONFIG.headers.length);
      const rows = request.guestNames.map(function (name) {
        const row = new Array(columnCount).fill("");
        row[columns.timestamp - 1] = now;
        row[columns.fullName - 1] = safeCellText_(name);
        row[columns.attendance - 1] = attendance;
        row[columns.submissionId - 1] = submissionId;
        return row;
      });

      // Append every guest in one batch so a group shares one timestamp and ID.
      sheet
        .getRange(sheet.getLastRow() + 1, 1, rows.length, columnCount)
        .setValues(rows);
      SpreadsheetApp.flush();

      return jsonResponse_({
        ok: true,
        submissionId: submissionId,
        guestCount: rows.length,
        message: "Your RSVP has been received.",
      });
    } finally {
      lock.releaseLock();
    }
  } catch (error) {
    const knownCodes = ["INVALID_REQUEST", "RATE_LIMITED", "CONFIGURATION"];
    const code = knownCodes.indexOf(error.code) >= 0 ? error.code : "SERVICE_ERROR";
    const message =
      code === "SERVICE_ERROR"
        ? "We could not save your RSVP. Please try again later."
        : error.message;

    return jsonResponse_({ ok: false, code: code, message: message });
  }
}

function validateRsvp_(payload) {
  if (
    !payload ||
    typeof payload.requestId !== "string" ||
    !/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
      payload.requestId,
    )
  ) {
    throw requestError_("INVALID_REQUEST", "Please refresh the page and try again.");
  }

  if (!Array.isArray(payload.guestNames) || payload.guestNames.length < 1 || payload.guestNames.length > 5) {
    throw requestError_("INVALID_REQUEST", "Choose between one and five guests.");
  }

  if (["accept", "decline"].indexOf(payload.attendance) < 0) {
    throw requestError_("INVALID_REQUEST", "Choose an attendance response.");
  }

  if (
    typeof payload.sourceIp !== "string" ||
    payload.sourceIp.length < 1 ||
    payload.sourceIp.length > 128
  ) {
    throw requestError_("INVALID_REQUEST", "The RSVP request could not be verified.");
  }

  const guestNames = payload.guestNames.map(function (name) {
    if (typeof name !== "string") {
      throw requestError_("INVALID_REQUEST", "Enter a full name for each guest.");
    }

    const normalized = name.trim().replace(/\s+/g, " ");
    if (normalized.length < 1 || normalized.length > 100) {
      throw requestError_("INVALID_REQUEST", "Each guest name must be 1 to 100 characters.");
    }

    return normalized;
  });

  const normalizedNames = guestNames.map(function (name) {
    return name.toLocaleLowerCase();
  });
  if (new Set(normalizedNames).size !== normalizedNames.length) {
    throw requestError_("INVALID_REQUEST", "Please remove duplicate guest names.");
  }

  return {
    requestId: payload.requestId,
    guestNames: guestNames,
    attendance: payload.attendance,
    sourceIp: payload.sourceIp,
  };
}

function isValidProxySignature_(payload, secret) {
  if (!payload || typeof payload.signature !== "string") return false;

  // Keep this field order identical to server/rsvpProxy.js.
  const canonicalPayload = JSON.stringify({
    requestId: payload.requestId,
    guestNames: payload.guestNames,
    attendance: payload.attendance,
    website: payload.website,
    sourceIp: payload.sourceIp,
  });
  const expected = bytesToHex_(
    Utilities.computeHmacSha256Signature(
      canonicalPayload,
      secret,
      Utilities.Charset.UTF_8,
    ),
  );

  if (expected.length !== payload.signature.length) return false;
  let difference = 0;
  for (let index = 0; index < expected.length; index += 1) {
    difference |= expected.charCodeAt(index) ^ payload.signature.charCodeAt(index);
  }
  return difference === 0;
}

function createSubmissionId_(requestId, secret) {
  const token = bytesToHex_(
    Utilities.computeHmacSha256Signature(
      "submission:" + requestId,
      secret,
      Utilities.Charset.UTF_8,
    ),
  );
  return "RSVP-" + token.substring(0, 32).toUpperCase();
}

function enforceRateLimit_(sourceIp) {
  const digest = bytesToHex_(
    Utilities.computeDigest(
      Utilities.DigestAlgorithm.SHA_256,
      sourceIp,
      Utilities.Charset.UTF_8,
    ),
  );
  const cache = CacheService.getScriptCache();
  const key = "rsvp-hour:" + digest;
  const currentCount = Number(cache.get(key) || 0);

  if (currentCount >= RSVP_CONFIG.rateLimitCount) {
    throw requestError_(
      "RATE_LIMITED",
      "Too many RSVP attempts were made from this connection. Please try again later.",
    );
  }

  cache.put(key, String(currentCount + 1), RSVP_CONFIG.rateLimitSeconds);
}

function getTargetSheet_() {
  const spreadsheet = SpreadsheetApp.openById(RSVP_CONFIG.spreadsheetId);
  const sheet = spreadsheet
    .getSheets()
    .filter(function (candidate) {
      return candidate.getSheetId() === RSVP_CONFIG.sheetId;
    })[0];

  if (!sheet) {
    throw requestError_(
      "CONFIGURATION",
      "The RSVP response tab was not found. Please contact the couple.",
    );
  }

  return sheet;
}

function ensureHeaders_(sheet) {
  const lastRow = sheet.getLastRow();
  const lastColumn = sheet.getLastColumn();

  if (lastRow === 0 && lastColumn === 0) {
    sheet.getRange(1, 1, 1, RSVP_CONFIG.headers.length).setValues([
      RSVP_CONFIG.headers,
    ]);
    return {
      timestamp: 1,
      fullName: 2,
      attendance: 3,
      submissionId: 4,
    };
  }

  if (lastColumn < 1 || lastRow < 1) {
    throw requestError_(
      "CONFIGURATION",
      "The response tab has data but no usable header row. Review row 1 without deleting existing entries.",
    );
  }

  const existingHeaders = sheet
    .getRange(1, 1, 1, lastColumn)
    .getDisplayValues()[0]
    .map(function (value) {
      return String(value).trim();
    });
  const columnFor = function (header) {
    return existingHeaders.indexOf(header) + 1;
  };
  const columns = {
    timestamp: columnFor("Timestamp"),
    fullName: columnFor("Full Name"),
    attendance: columnFor("Attendance"),
    submissionId: columnFor("Submission ID"),
  };

  if (
    Object.keys(columns).some(function (key) {
      return columns[key] === 0;
    })
  ) {
    throw requestError_(
      "CONFIGURATION",
      "The response tab must have Timestamp, Full Name, Attendance, and Submission ID headers in row 1. Existing data was left untouched.",
    );
  }

  return columns;
}

function submissionExists_(sheet, submissionIdColumn, submissionId) {
  const lastRow = sheet.getLastRow();
  if (lastRow < 2) return false;

  const existingIds = sheet
    .getRange(2, submissionIdColumn, lastRow - 1, 1)
    .getDisplayValues();
  return existingIds.some(function (row) {
    return row[0] === submissionId;
  });
}

function safeCellText_(value) {
  // Google Sheets may interpret values beginning with formula markers as formulas.
  return /^[\s]*[=+\-@]/.test(value) ? "'" + value : value;
}

function requestError_(code, message) {
  const error = new Error(message);
  error.code = code;
  return error;
}

function bytesToHex_(bytes) {
  return bytes
    .map(function (byte) {
      return ("0" + (byte & 255).toString(16)).slice(-2);
    })
    .join("");
}

function jsonResponse_(payload) {
  return ContentService.createTextOutput(JSON.stringify(payload)).setMimeType(
    ContentService.MimeType.JSON,
  );
}
