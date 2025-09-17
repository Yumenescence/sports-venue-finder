export default class Logger {
  static info(event, data) {
    try {
      console.log(`[INFO] ${event}`, sanitize(data));
    } catch {}
  }

  static warn(event, data) {
    try {
      console.warn(`[WARN] ${event}`, sanitize(data));
    } catch {}
  }

  static error(event, data) {
    try {
      console.error(`[ERROR] ${event}`, sanitize(data));
    } catch {}
  }
}

function sanitize(data) {
  if (!data) return data;
  try {
    const copy = JSON.parse(JSON.stringify(data));
    if (copy?.headers?.["X-Goog-Api-Key"])
      copy.headers["X-Goog-Api-Key"] = "***";
    return copy;
  } catch {
    return data;
  }
}
