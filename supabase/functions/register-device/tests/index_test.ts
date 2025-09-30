import { assertEquals } from "./test_utils.ts";

import {
  handleRegisterDeviceRequest,
  type DevicesRepository,
  type RegisterDevicePayload,
} from "../handler.ts";

class StubDevicesRepository implements DevicesRepository {
  public lastPayload: (RegisterDevicePayload & { lastSeenAt: string }) | null = null;
  constructor(private readonly simulateError = false) {}

  async upsertDevice(payload: RegisterDevicePayload & { lastSeenAt: string }) {
    this.lastPayload = payload;
    if (this.simulateError) {
      return { data: null, error: { message: "db error" } };
    }
    return { data: { device_key: payload.deviceKey } };
  }
}

Deno.test("handleRegisterDeviceRequest returns 405 for non-POST methods", async () => {
  const res = await handleRegisterDeviceRequest(
    new Request("http://localhost", { method: "GET" }),
    new StubDevicesRepository(),
  );
  assertEquals(res.status, 405);
});

Deno.test("handleRegisterDeviceRequest returns 400 for invalid JSON", async () => {
  const res = await handleRegisterDeviceRequest(
    new Request("http://localhost", { method: "POST", body: "not-json" }),
    new StubDevicesRepository(),
  );
  assertEquals(res.status, 400);
});

Deno.test("handleRegisterDeviceRequest returns 422 for validation errors", async () => {
  const res = await handleRegisterDeviceRequest(
    new Request("http://localhost", {
      method: "POST",
      body: JSON.stringify({}),
      headers: { "content-type": "application/json" },
    }),
    new StubDevicesRepository(),
  );
  assertEquals(res.status, 422);
});

Deno.test("handleRegisterDeviceRequest returns 500 when repository fails", async () => {
  const repo = new StubDevicesRepository(true);
  const res = await handleRegisterDeviceRequest(
    new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceKey: "device-123",
        fcmToken: "token",
        platform: "ios",
      }),
    }),
    repo,
  );
  assertEquals(res.status, 500);
});

Deno.test("handleRegisterDeviceRequest returns 200 for successful registration", async () => {
  const repo = new StubDevicesRepository();
  const res = await handleRegisterDeviceRequest(
    new Request("http://localhost", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({
        deviceKey: "device-123",
        fcmToken: "token",
        platform: "android",
      }),
    }),
    repo,
  );

  assertEquals(res.status, 200);
  const body = await res.json();
  assertEquals(body.data.device_key, "device-123");
  if (!repo.lastPayload) {
    throw new Error("repository was not called");
  }
  assertEquals(repo.lastPayload.deviceKey, "device-123");
});
