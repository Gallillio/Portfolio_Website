// Server-sent-events parser.
//
// A "data:" frame can straddle a TCP chunk boundary, so chunks must be buffered
// and split on the blank-line delimiter rather than parsed chunk-by-chunk. Doing
// this naively produces failures that are intermittent and load-dependent, which
// is the worst kind to debug.

/** Yields the raw JSON payload of each `data:` frame, in order. */
export async function* parseSSE(
  body: ReadableStream<Uint8Array>
): AsyncGenerator<string, void, unknown> {
  const reader = body.getReader();
  const decoder = new TextDecoder();
  let buffer = "";

  try {
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });

      let boundary: number;
      // Accept \n\n and \r\n\r\n.
      while ((boundary = findBoundary(buffer)) !== -1) {
        const block = buffer.slice(0, boundary);
        buffer = buffer.slice(boundary + boundaryLength(buffer, boundary));
        const payload = extractData(block);
        if (payload !== null) yield payload;
      }
    }

    // Flush a trailing frame that arrived without a terminating blank line.
    buffer += decoder.decode();
    const payload = extractData(buffer);
    if (payload !== null) yield payload;
  } finally {
    reader.releaseLock();
  }
}

function findBoundary(buffer: string): number {
  const lf = buffer.indexOf("\n\n");
  const crlf = buffer.indexOf("\r\n\r\n");
  if (lf === -1) return crlf;
  if (crlf === -1) return lf;
  return Math.min(lf, crlf);
}

function boundaryLength(buffer: string, at: number): number {
  return buffer.startsWith("\r\n\r\n", at) ? 4 : 2;
}

function extractData(block: string): string | null {
  const data = block
    .split(/\r?\n/)
    .filter((line) => line.startsWith("data:"))
    .map((line) => line.slice(5).trimStart())
    .join("\n");

  if (!data || data === "[DONE]") return null;
  return data;
}

/** Serialize one frame for the wire. */
export function encodeSSE(payload: unknown): string {
  return `data: ${JSON.stringify(payload)}\n\n`;
}
