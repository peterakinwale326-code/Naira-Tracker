const configuredApiUrl = process.env.NEXT_PUBLIC_API_URL?.trim();
const fallbackApiUrl =
  process.env.NODE_ENV === "production" ? "https://api.example.com" : "http://localhost:4000";

if (configuredApiUrl) {
  let parsedApiUrl: URL;
  try {
    parsedApiUrl = new URL(configuredApiUrl);
  } catch {
    throw new Error("NEXT_PUBLIC_API_URL must be an absolute backend origin.");
  }

  if (
    !["http:", "https:"].includes(parsedApiUrl.protocol) ||
    parsedApiUrl.pathname !== "/" ||
    parsedApiUrl.search ||
    parsedApiUrl.hash
  ) {
    throw new Error("NEXT_PUBLIC_API_URL must be an HTTP(S) origin without a path, query, or fragment.");
  }

  if (process.env.NODE_ENV === "production" && parsedApiUrl.protocol !== "https:") {
    throw new Error("NEXT_PUBLIC_API_URL must use HTTPS in production.");
  }
} else if (process.env.NODE_ENV === "production") {
  console.warn(
    "NEXT_PUBLIC_API_URL is not set. Using the example backend until you add the real production origin in Vercel."
  );
}

export const API_BASE_URL = (configuredApiUrl || fallbackApiUrl).replace(/\/$/, "");
