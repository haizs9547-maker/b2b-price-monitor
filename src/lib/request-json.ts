export class JsonBodyError extends Error {
  constructor(message: string, readonly status = 400) {
    super(message);
  }
}

export function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === "object" && !Array.isArray(value);
}

export async function readJsonObject(message: Request | Response, maxBytes: number) {
  if (!/^application\/json(?:\s*;|$)/i.test(message.headers.get("content-type") || "")) {
    throw new JsonBodyError("Expected an application/json request body.", 415);
  }
  if (Number(message.headers.get("content-length")) > maxBytes) {
    throw new JsonBodyError("The JSON body is too large.", 413);
  }
  const reader = message.body?.getReader();
  if (!reader) throw new JsonBodyError("Missing JSON body.");

  const decoder = new TextDecoder();
  let json = "";
  let bytes = 0;
  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      bytes += value.byteLength;
      if (bytes > maxBytes) {
        void reader.cancel().catch(() => {});
        throw new JsonBodyError("The JSON body is too large.", 413);
      }
      json += decoder.decode(value, { stream: true });
    }
    const body: unknown = JSON.parse(json + decoder.decode());
    if (isRecord(body)) return body;
    throw new JsonBodyError("Expected a JSON object.");
  } catch (error) {
    if (error instanceof JsonBodyError) throw error;
    throw new JsonBodyError("Invalid JSON body.");
  } finally {
    reader.releaseLock();
  }
}
