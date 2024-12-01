const nextConfig = {
  reactStrictMode: true,
  // swcMinify: true,
  env: {
    MONGODB_URI:
      "mongodb+srv://hridoykhan62894:k2wuqrO7bAVDfCCz@cluster0.os3ns.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0",
    GOOGLE_CLIENT_ID:
      "736642322529-u8btqrnn28ale2b2psb980nuaplpa558.apps.googleusercontent.com",
    GOOGLE_CLIENT_SECRET: "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",
    NEXTAUTH_URL:"https://orange-guacamole-5wgv9v5466r37gq7-3000.app.github.dev",
    NEXTAUTH_SECRET:
      "7c985f1d478158c04ce8ac52e73b4a3e5223e0b7bf89996c57684d6fa288f912",
    NEXT_PUBLIC_POSTHOG_KEY:
      "phc_d5zPRbWhiVfhRs9xfjwhngZ86mIB4kPfhOfbcEGSrjc",
    NEXT_PUBLIC_POSTHOG_HOST: "https://us.i.posthog.com"
  },
  async headers() {
    return [
      {
        source: "/api/:path*",
        headers: [
          {
            key: "Cache-Control",
            value: "public, s-maxage=60, stale-while-revalidate=59"
          }
        ]
      }
    ];
  }
};

module.exports = nextConfig;
