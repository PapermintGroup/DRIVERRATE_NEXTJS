// /pages/api/auth/logout.js
import { serialize } from "cookie";

export default function handler(req, res) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  // Delete the token cookie
  res.setHeader(
    "Set-Cookie",
    serialize("token", "", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      path: "/",   // must match path used when login cookie was set
      maxAge: -1,  // forces deletion
    })
  );

  res.status(200).json({ ok: true });
}
