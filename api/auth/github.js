import crypto from "crypto";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const GITHUB_CLIENT_ID = process.env.GITHUB_CLIENT_ID;

  if (!GITHUB_CLIENT_ID) {
    console.error("GITHUB_CLIENT_ID is not configured");
    const frontendUrl = process.env.FRONTEND_URL || "";
    return res.redirect(302, `${frontendUrl}/?auth_error=oauth_not_configured`);
  }

  // Determine redirect URI based on environment
  const REDIRECT_URI =
    process.env.GITHUB_REDIRECT_URI ||
    (process.env.VERCEL_URL
      ? `https://${process.env.VERCEL_URL}/api/auth/github/callback`
      : "http://localhost:3000/api/auth/github/callback");

  // Generate state for CSRF protection
  const state = crypto.randomUUID();

  // Store state in a short-lived cookie (5 minutes)
  res.setHeader(
    "Set-Cookie",
    `oauth_state=${state}; HttpOnly; Path=/; Max-Age=300; SameSite=Lax`
  );

  // Build GitHub OAuth URL
  const params = new URLSearchParams({
    client_id: GITHUB_CLIENT_ID,
    redirect_uri: REDIRECT_URI,
    scope: "user:email",
    state: state,
  });

  const githubAuthUrl = `https://github.com/login/oauth/authorize?${params}`;

  // Redirect to GitHub
  res.redirect(302, githubAuthUrl);
}
