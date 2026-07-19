type Level = "info" | "warn" | "error";

export function log(level: Level, message: string, meta?: object): void {
  Promise.resolve().then(() => {
    const timestamp = new Date().toISOString();
    const prefix = `[${level.toUpperCase()}]`;
    const entry = `${prefix} ${timestamp} — ${message}`;

    if (level === "info") {
      console.info(entry, meta ?? "");
    } else if (level === "warn") {
      console.warn(entry, meta ?? "");
    } else {
      console.error(entry, meta ?? "");
    }
  });
}
