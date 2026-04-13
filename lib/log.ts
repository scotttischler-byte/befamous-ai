export function logApi(tag: string, data: Record<string, unknown>) {
  console.log(`[BGE API] ${tag}`, JSON.stringify(data));
}
