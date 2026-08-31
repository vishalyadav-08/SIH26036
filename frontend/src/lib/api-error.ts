import { isAxiosError } from "axios";

/**
 * Reads a human-usable message out of the API's error envelope.
 *
 * The backend normalises every error to {code, message, fieldErrors,
 * requestId} (API_CONTRACT.md), so `message` is the reliable field — but
 * network failures produce no body at all and must not be blamed on the form.
 */
export function readApiError(error: unknown, fallback = "Something went wrong. Please try again.") {
  if (!isAxiosError(error)) return fallback;

  if (!error.response) {
    return "We couldn't reach the server. Check your connection and try again.";
  }

  const data = error.response.data as
    | { message?: string; detail?: string; fieldErrors?: { field: string; message: string }[] }
    | undefined;

  if (data?.fieldErrors?.length) {
    const first = data.fieldErrors[0];

    return `${first.field}: ${first.message}`;
  }

  if (typeof data?.message === "string") return data.message;
  if (typeof data?.detail === "string") return data.detail;

  if (error.response.status >= 500) {
    return "Our server had a problem. Please try again in a moment.";
  }

  return fallback;
}

/** Field-level errors, keyed by field name, for wiring into a form. */
export function readFieldErrors(error: unknown): Record<string, string> {
  if (!isAxiosError(error)) return {};

  const data = error.response?.data as
    | { fieldErrors?: { field: string; message: string }[] }
    | undefined;

  return Object.fromEntries(
    (data?.fieldErrors ?? []).map((e) => [e.field, e.message])
  );
}
