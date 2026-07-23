const FATAL_LEVELS = new Set(["SEVERE", "ERROR"]);

function requestUrlFromMessage(message) {
  const match = String(message).match(/\bhttps?:\/\/[^\s]+/i);
  if (!match) return null;
  try {
    return new URL(match[0]);
  } catch {
    return null;
  }
}

export function classifyBrowserLogs(logs, baseUrl) {
  const firstPartyOrigin = new URL(baseUrl).origin;
  const fatal = [];
  const externalNetwork = [];

  for (const entry of logs) {
    if (!FATAL_LEVELS.has(String(entry.level).toUpperCase())) continue;

    if (String(entry.source).toLowerCase() === "network") {
      const requestUrl = requestUrlFromMessage(entry.message);
      if (requestUrl && requestUrl.origin !== firstPartyOrigin) {
        externalNetwork.push(entry);
        continue;
      }
    }

    fatal.push(entry);
  }

  return { fatal, externalNetwork };
}
