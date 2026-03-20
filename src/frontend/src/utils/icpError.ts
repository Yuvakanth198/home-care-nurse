/**
 * Extracts a human-readable error message from an ICP canister rejection.
 *
 * Handles multiple SDK error formats:
 *   - "Canister ... trapped explicitly: <REASON>"
 *   - "Reject text: <REASON>"
 *   - "message: '<REASON>'" or "message: \"<REASON>\""
 *   - AgentHTTPResponseError with nested body
 *   - Raw JavaScript errors (TypeError, SyntaxError, etc.)
 */
export function extractICPError(err: unknown): {
  message: string;
  code: string;
} {
  // Build the fullest possible raw string from all available properties
  const parts: string[] = [];

  if (err instanceof Error) {
    if (err.message) parts.push(err.message);
    if (err.stack) parts.push(err.stack);
    const anyErr = err as unknown as Record<string, unknown>;
    if (anyErr.cause) {
      const c = anyErr.cause;
      parts.push(c instanceof Error ? c.message : String(c));
    }
    // AgentHTTPResponseError has a `response` property
    if (anyErr.response) {
      try {
        parts.push(JSON.stringify(anyErr.response));
      } catch {}
    }
    // Some SDK errors expose `reject_message` or `errorCode`
    for (const key of [
      "reject_message",
      "errorCode",
      "description",
      "details",
    ]) {
      if (anyErr[key]) parts.push(String(anyErr[key]));
    }
  } else if (typeof err === "object" && err !== null) {
    try {
      parts.push(JSON.stringify(err));
    } catch {}
    parts.push(String(err));
  } else {
    parts.push(String(err));
  }

  const raw = parts.join("\n");

  // Log full error to console for debugging
  console.error("[ICP Error Raw]", raw, err);

  // ---- ICP canister trap patterns ----

  // Format 1: "trapped explicitly: <REASON>"
  const trapPatterns = [
    /trapped explicitly[:\s]+([^\n]+)/i,
    /trapped explicitly[:\s]+([\s\S]+?)(?:\n\n|\r\n\r\n|$)/i,
    /Canister[^\n]+trapped[^:]*:[\s]*([^\n]+)/i,
  ];
  for (const pat of trapPatterns) {
    const m = raw.match(pat);
    if (m) {
      const reason = m[1]
        .trim()
        .replace(/\\n.*$/s, "")
        .trim();
      if (reason) {
        const code = toErrorCode(reason);
        console.error(`[ICP Error Code: ${code}] ${reason}`);
        return { message: reason, code };
      }
    }
  }

  // Format 2: description field in JSON body
  const descMatch = raw.match(/"description"\s*:\s*"([^"]+)"/);
  if (descMatch) {
    const full = descMatch[1];
    const innerTrap = full.match(/trapped explicitly[:\s]+(.+)/);
    if (innerTrap) {
      const reason = innerTrap[1].trim();
      const code = toErrorCode(reason);
      return { message: reason, code };
    }
    const code = toErrorCode(full);
    return { message: full, code };
  }

  // Format 3: reject_message field
  const rejectMsgMatch = raw.match(/"reject_message"\s*:\s*"([^"]+)"/);
  if (rejectMsgMatch) {
    const reason = rejectMsgMatch[1].trim();
    const code = toErrorCode(reason);
    return { message: reason, code };
  }

  // Format 4: Reject text
  const rejectMatch = raw.match(/[Rr]eject[\s_]text[:\s]+(.+?)(?:,|\n|$)/);
  if (rejectMatch) {
    const reason = rejectMatch[1].trim();
    const code = toErrorCode(reason);
    return { message: reason, code };
  }

  // Format 5: Quoted message field
  const quotedMatch = raw.match(/message[:\s]+['"]([^'"]+)['"]/i);
  if (quotedMatch) {
    const reason = quotedMatch[1].trim();
    const code = toErrorCode(reason);
    return { message: reason, code };
  }

  // Format 6: Error code at start like "IC0503: ..."
  const icCodeMatch = raw.match(/IC\d+:\s*(.+)/);
  if (icCodeMatch) {
    const reason = icCodeMatch[1].trim();
    const code = toErrorCode(reason);
    return { message: reason, code };
  }

  // Format 7: Try to parse as JSON and look for any message/reason fields
  for (const part of parts) {
    try {
      const parsed = JSON.parse(part) as Record<string, unknown>;
      for (const key of ["message", "reason", "error", "detail", "text"]) {
        if (typeof parsed[key] === "string" && parsed[key]) {
          const reason = String(parsed[key]);
          const code = toErrorCode(reason);
          return { message: reason, code };
        }
      }
    } catch {
      /* not JSON, skip */
    }
  }

  // Not connected / actor not ready
  if (
    raw.toLowerCase().includes("not connected") ||
    (raw.toLowerCase().includes("actor") &&
      !raw.toLowerCase().includes("canister")) ||
    raw.toLowerCase().includes("canister_id")
  ) {
    return {
      message: "Backend not ready. Please wait a moment and try again.",
      code: "E001",
    };
  }

  // Network/fetch errors
  if (
    raw.toLowerCase().includes("failed to fetch") ||
    raw.toLowerCase().includes("networkerror") ||
    raw.toLowerCase().includes("network error")
  ) {
    return {
      message:
        "Network error. Please check your internet connection and try again.",
      code: "E005",
    };
  }

  // BigInt conversion errors
  if (
    raw.toLowerCase().includes("bigint") ||
    raw.toLowerCase().includes("cannot convert")
  ) {
    return {
      message:
        "Invalid number in form (Pincode must be exactly 6 digits). Please check your entries.",
      code: "E013",
    };
  }

  // Fallback E099: show full raw text (truncated) so the user can debug
  const displayMessage =
    raw.length > 400 ? `${raw.substring(0, 400)}...` : raw || "Unknown error";
  console.error(`[ICP Error Code: E099] Full raw: ${raw}`);
  return {
    message: `Registration failed (E099). Open browser console (F12) for full error. Summary: ${displayMessage}`,
    code: "E099",
  };
}

function toErrorCode(reason: string): string {
  const r = reason.toLowerCase();
  if (r.includes("already exists")) return "E002";
  if (r.includes("does not exist") || r.includes("not found")) return "E003";
  if (r.includes("name is required")) return "E010";
  if (r.includes("phone")) return "E011";
  if (r.includes("registration number")) return "E012";
  if (r.includes("pin") || r.includes("pincode")) return "E013";
  if (r.includes("validation") || r.includes("invalid")) return "E014";
  if (r.includes("unauthorized")) return "E403";
  if (r.includes("lock") || r.includes("busy")) return "E423";
  return "E099";
}
