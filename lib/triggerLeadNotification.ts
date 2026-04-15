/**
 * Stub for post-intake notifications (e.g. Twilio SMS / internal alerts).
 * Replace implementation when wiring production integrations.
 */
export function triggerLeadNotification(formData: Record<string, unknown>): void {
  if (process.env.NODE_ENV === "development") {
    console.info("[triggerLeadNotification] queued", {
      keys: Object.keys(formData),
    });
  }
}
