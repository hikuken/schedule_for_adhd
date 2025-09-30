import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import { requireEnv } from "./env.ts";

let cachedClient: SupabaseClient | null = null;

export function getServiceRoleClient(): SupabaseClient {
  if (cachedClient) {
    return cachedClient;
  }

  const url = requireEnv("EDGE_SUPABASE_URL");
  const serviceRoleKey = requireEnv("EDGE_SUPABASE_SERVICE_ROLE_KEY");

  cachedClient = createClient(url, serviceRoleKey, {
    auth: {
      persistSession: false,
    },
    global: {
      headers: {
        "X-Client-Info": "register-device-edge-function",
      },
    },
  });

  return cachedClient;
}
