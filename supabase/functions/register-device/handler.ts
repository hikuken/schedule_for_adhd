import { errorResponse, jsonResponse } from "../_shared/http.ts";

export interface DevicesRepository {
  upsertDevice(payload: RegisterDevicePayload & { lastSeenAt: string }): Promise<{
    data: Record<string, unknown> | null;
    error?: { message: string; hint?: string };
  }>;
}

export type RegisterDevicePayload = {
  deviceKey: string;
  fcmToken: string;
  platform: "ios" | "android" | "web";
  timezone?: string;
  locale?: string;
  appVersion?: string;
};

export type ValidationIssue = {
  path: string;
  message: string;
};

export type ValidationResult =
  | { success: true; data: RegisterDevicePayload }
  | { success: false; issues: ValidationIssue[] };

const allowedPlatforms = new Set(["ios", "android", "web"]);

export function validatePayload(body: unknown): ValidationResult {
  if (typeof body !== "object" || body === null) {
    return {
      success: false,
      issues: [{ path: "root", message: "Request body must be an object" }],
    };
  }

  const record = body as Record<string, unknown>;
  const issues: ValidationIssue[] = [];

  const deviceKey = validateString(record.deviceKey, "deviceKey", issues, true);
  const fcmToken = validateString(record.fcmToken, "fcmToken", issues, true);
  const platform = validatePlatform(record.platform, issues);
  const timezone = validateString(record.timezone, "timezone", issues, false);
  const locale = validateString(record.locale, "locale", issues, false);
  const appVersion = validateString(record.appVersion, "appVersion", issues, false);

  if (deviceKey === null || fcmToken === null || platform === null || issues.length > 0) {
    return { success: false, issues };
  }

  return {
    success: true,
    data: {
      deviceKey,
      fcmToken,
      platform,
      timezone: timezone ?? undefined,
      locale: locale ?? undefined,
      appVersion: appVersion ?? undefined,
    },
  };
}

function validateString(
  value: unknown,
  path: string,
  issues: ValidationIssue[],
  required: boolean,
): string | null {
  if (value === undefined || value === null) {
    if (required) {
      issues.push({ path, message: `${path} is required` });
    }
    return null;
  }

  if (typeof value !== "string" || value.trim() === "") {
    issues.push({ path, message: `${path} must be a non-empty string` });
    return null;
  }

  return value;
}

function validatePlatform(
  value: unknown,
  issues: ValidationIssue[],
): RegisterDevicePayload["platform"] | null {
  if (typeof value !== "string") {
    issues.push({ path: "platform", message: "platform must be a string" });
    return null;
  }

  if (!allowedPlatforms.has(value as string)) {
    issues.push({ path: "platform", message: "platform must be ios, android, or web" });
    return null;
  }

  return (value as RegisterDevicePayload["platform"]);
}

export async function handleRegisterDeviceRequest(
  req: Request,
  repo: DevicesRepository,
): Promise<Response> {
  if (req.method !== "POST") {
    return errorResponse(405, "Method not allowed", { allow: "POST" }, {
      headers: { allow: "POST" },
    });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch (_error) {
    return errorResponse(400, "Request body must be valid JSON");
  }

  const parsed = validatePayload(body);
  if (!parsed.success) {
    return errorResponse(422, "Validation failed", { issues: parsed.issues });
  }

  const payload = parsed.data;
  const result = await repo.upsertDevice({ ...payload, lastSeenAt: new Date().toISOString() });

  if (result.error) {
    console.error("register-device upsert failed", result.error);
    return errorResponse(500, "Failed to register device", result.error);
  }

  return jsonResponse({ data: result.data }, { status: 200 });
}
