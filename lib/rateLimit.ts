import cache from "./cache";

export async function rateLimit(identifier: string) {
  const tokenCount = cache.get<number>(identifier) || 0;

  if (tokenCount >= 10) {
    return { success: false };
  }

  cache.set(identifier, tokenCount + 1, 60); // 60 seconds window
  return { success: true };
}
