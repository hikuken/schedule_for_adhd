import { type SupabaseClient } from "@supabase/supabase-js";

import { errorResponse } from "../_shared/http.ts";
import { getServiceRoleClient } from "../_shared/supabaseClient.ts";
import {
  handleRegisterDeviceRequest,
  type DevicesRepository,
  type RegisterDevicePayload,
} from "./handler.ts";

class SupabaseDevicesRepository implements DevicesRepository {
  constructor(private readonly client: SupabaseClient = getServiceRoleClient()) {}

  async upsertDevice(payload: RegisterDevicePayload & { lastSeenAt: string }) {
    const { data, error } = await this.client.from("devices")
      .upsert({
        device_key: payload.deviceKey,
        fcm_token: payload.fcmToken,
        platform: payload.platform,
        timezone: payload.timezone ?? null,
        locale: payload.locale ?? null,
        app_version: payload.appVersion ?? null,
        last_seen_at: payload.lastSeenAt,
      }, {
        onConflict: "device_key",
      })
      .select(
        "id, device_key, fcm_token, platform, timezone, locale, app_version, last_seen_at, created_at, updated_at",
      )
      .single();

    if (error) {
      return { data: null, error: { message: error.message, hint: error.hint ?? undefined } };
    }

    return { data };
  }
}

Deno.serve((req) => handleRegisterDeviceRequest(req, new SupabaseDevicesRepository()).catch((error) => {
  console.error("register-device unexpected error", error);
  return errorResponse(500, "Unhandled error");
}));
