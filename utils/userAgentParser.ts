import UAParser from "ua-parser-js";

interface UserAgentInfo {
  browser: string;
  os: string;
  device: "desktop" | "mobile" | "tablet" | "other";
}

export function parseUserAgent(userAgent: string | null) {
  const parser = new UAParser(userAgent || "");
  return {
    browser: parser.getBrowser().name || "Unknown",
    os: parser.getOS().name || "Unknown",
    device: parser.getDevice().type || "desktop" // Default to desktop
  };
}
