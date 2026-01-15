import { getDb } from "../../db.js";
import jwt from "jsonwebtoken";

const JWT_SECRET =
  process.env.JWT_SECRET || "your-secret-key-change-in-production";
const COOKIE_NAME = "auth_token";

export default async function handler(req, res) {
  // CORS headers
  res.setHeader("Access-Control-Allow-Origin", req.headers.origin || "*");
  res.setHeader("Access-Control-Allow-Credentials", "true");

  if (req.method !== "GET") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { code, state, error: githubError } = req.query;
  const FRONTEND_URL = process.env.FRONTEND_URL || "";

  // Handle GitHub errors (user denied, etc.)
  if (githubError) {
    return res.redirect(
      302,
      `${FRONTEND_URL}/?auth_error=${encodeURIComponent(githubError)}`
    );
  }

  if (!code || !state) {
    return res.redirect(302, `${FRONTEND_URL}/?auth_error=missing_params`);
  }

  // Get cookies from request
  const cookies =
    req.headers.cookie?.split(";").reduce((acc, cookie) => {
      const [key, value] = cookie.trim().split("=");
      acc[key] = value;
      return acc;
    }, {}) || {};

  // Verify state (CSRF protection)
  if (cookies.oauth_state !== state) {
    return res.redirect(302, `${FRONTEND_URL}/?auth_error=invalid_state`);
  }

  // Clear oauth_state cookie
  const clearStateCookie = `oauth_state=; HttpOnly; Path=/; Max-Age=0; SameSite=Lax`;

  try {
    // Determine redirect URI (must match what was used in initiation)
    const REDIRECT_URI =
      process.env.GITHUB_REDIRECT_URI ||
      (process.env.VERCEL_URL
        ? `https://${process.env.VERCEL_URL}/api/auth/github/callback`
        : "http://localhost:3000/api/auth/github/callback");

    // Exchange code for access token
    const tokenResponse = await fetch(
      "https://github.com/login/oauth/access_token",
      {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: process.env.GITHUB_CLIENT_ID,
          client_secret: process.env.GITHUB_CLIENT_SECRET,
          code: code,
          redirect_uri: REDIRECT_URI,
        }),
      }
    );

    const tokenData = await tokenResponse.json();

    if (tokenData.error) {
      console.error("GitHub token error:", tokenData.error);
      res.setHeader("Set-Cookie", clearStateCookie);
      return res.redirect(
        302,
        `${FRONTEND_URL}/?auth_error=${encodeURIComponent(tokenData.error)}`
      );
    }

    const accessToken = tokenData.access_token;

    // Fetch user info from GitHub
    const userResponse = await fetch("https://api.github.com/user", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const githubUser = await userResponse.json();

    // Fetch user emails (needed if email is private)
    const emailsResponse = await fetch("https://api.github.com/user/emails", {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        Accept: "application/vnd.github.v3+json",
      },
    });

    const emails = await emailsResponse.json();

    // Get primary verified email
    const primaryEmail =
      emails.find((e) => e.primary && e.verified)?.email ||
      emails.find((e) => e.verified)?.email ||
      githubUser.email;

    if (!primaryEmail) {
      res.setHeader("Set-Cookie", clearStateCookie);
      return res.redirect(302, `${FRONTEND_URL}/?auth_error=no_email`);
    }

    const sql = getDb();
    let user;

    // Check if user exists by github_id
    const existingByGithub = await sql`
      SELECT id, name, email, profile_picture FROM users WHERE github_id = ${githubUser.id}
    `;

    if (existingByGithub.length > 0) {
      // User found by GitHub ID - log them in
      user = existingByGithub[0];
    } else {
      // Check if user exists by email
      const existingByEmail = await sql`
        SELECT id, name, email, profile_picture, github_id FROM users WHERE email = ${primaryEmail}
      `;

      if (existingByEmail.length > 0) {
        // User exists with this email - link GitHub account
        const result = await sql`
          UPDATE users
          SET github_id = ${githubUser.id}
          WHERE id = ${existingByEmail[0].id}
          RETURNING id, name, email, profile_picture
        `;
        user = result[0];
      } else {
        // Create new user
        const result = await sql`
          INSERT INTO users (name, email, github_id, auth_provider, profile_picture)
          VALUES (
            ${githubUser.name || githubUser.login},
            ${primaryEmail},
            ${githubUser.id},
            'github',
            ${githubUser.avatar_url || null}
          )
          RETURNING id, name, email, profile_picture
        `;
        user = result[0];
      }
    }

    // Create JWT token
    const token = jwt.sign({ userId: user.id, email: user.email }, JWT_SECRET, {
      expiresIn: "1h",
    });

    // Set auth cookie and clear state cookie
    res.setHeader("Set-Cookie", [
      clearStateCookie,
      `${COOKIE_NAME}=${token}; HttpOnly; Path=/; Max-Age=${
        60 * 60
      }; SameSite=Lax`,
    ]);

    // Redirect to frontend with success
    res.redirect(302, `${FRONTEND_URL}/?auth=success`);
  } catch (error) {
    console.error("GitHub OAuth error:", error);
    res.setHeader("Set-Cookie", clearStateCookie);
    res.redirect(302, `${FRONTEND_URL}/?auth_error=server_error`);
  }
}
