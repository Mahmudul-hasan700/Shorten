const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  env: {
    MONGODB_URI:
      "mongodb+srv://hridoykhan62894:k2wuqrO7bAVDfCCz@cluster0.os3ns.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    GOOGLE_CLIENT_ID: process.env.GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET: process.env.GOOGLE_CLIENT_SECRET,
    NEXTAUTH_SECRET:
      "7c985f1d478158c04ce8ac52e73b4a3e5223e0b7bf89996c57684d6fa288f912",
    NEXTAUTH_URL:
      "https://16742ba4-21fb-45f4-8e84-c7b52c6fb2f6-00-l80az4gsq7vk.kirk.replit.dev",
    NEXT_PUBLIC_BASE_URL:
      "https://a077f958-fdc0-4536-b60c-2e2d864dfd9a-00-100who3a63l8u.pike.replit.dev",
    NEXT_ENV: "development",
    NEXT_PUBLIC_POSTHOG_KEY:
      "phc_d5zPRbWhiVfhRs9xfjwhngZ86mIB4kPfhOfbcEGSrjc",
    NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com"
  }
};

module.exports = nextConfig;
