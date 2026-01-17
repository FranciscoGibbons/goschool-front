/**
 * Safely parse JSON response, handling empty bodies
 */
export async function safeJson<T = unknown>(response: Response): Promise<T> {
  const text = await response.text();
  if (!text || !text.trim()) {
    return { success: true } as T;
  }
  try {
    return JSON.parse(text) as T;
  } catch {
    return { success: true, raw: text } as T;
  }
}
