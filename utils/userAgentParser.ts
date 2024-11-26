import UAParser from "ua-parser-js";

export function parseUserAgent(userAgent: string | null) {
  const parser = new UAParser(userAgent || "");
  return {
    browser: parser.getBrowser().name || "Unknown",
    os: parser.getOS().name || "Unknown",
    device: parser.getDevice().type || "desktop" // Default to desktop
  };
}
