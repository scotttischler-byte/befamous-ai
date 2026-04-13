export type BgeLogLevel = "info" | "warn" | "error";

/** BeFamous Growth Engine — structured console logging */
export function bgeLog(
  level: BgeLogLevel,
  message: string,
  meta?: unknown
): void {
  const prefix = "[BGE]";
  if (meta !== undefined) {
    if (level === "error") console.error(prefix, message, meta);
    else if (level === "warn") console.warn(prefix, message, meta);
    else console.log(prefix, message, meta);
  } else {
    if (level === "error") console.error(prefix, message);
    else if (level === "warn") console.warn(prefix, message);
    else console.log(prefix, message);
  }
}
