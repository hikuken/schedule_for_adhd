export function jsonResponse(
  body: unknown,
  init: ResponseInit = {},
): Response {
  const baseHeaders = new Headers(init.headers);
  if (!baseHeaders.has("content-type")) {
    baseHeaders.set("content-type", "application/json; charset=utf-8");
  }
  return new Response(JSON.stringify(body), {
    status: init.status ?? 200,
    headers: baseHeaders,
  });
}

export function errorResponse(
  status: number,
  message: string,
  details?: Record<string, unknown>,
  init: ResponseInit = {},
): Response {
  const headers = new Headers(init.headers);
  return jsonResponse({ error: { message, ...details } }, {
    status,
    headers,
  });
}
