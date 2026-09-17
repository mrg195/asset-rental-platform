const id = process.env.GITHUB_OAUTH_ID;
const secret = process.env.GITHUB_OAUTH_SECRET;

async function withError(msg) {
  return new Response(msg, { status: 400, headers: { "Content-Type": "text/plain; charset=utf-8" } });
}

export default {
  async fetch(request, env, ctx) {
    const url = new URL(request.url);

    // CORS preflight
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "access-control-allow-origin": "*",
          "access-control-allow-methods": "GET,POST,OPTIONS",
          "access-control-allow-headers": "Content-Type,Authorization",
        },
      });
    }

    // OAuth callback — exchange code for token, then redirect back to CMS
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) return withError("Missing authorization code");

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({ client_id: id, client_secret: secret, code }),
      });
      const tokenData = await tokenRes.json();
      if (tokenData.error) return withError("GitHub auth error: " + tokenData.error_description);

      const redirectUrl = new URL(url.searchParams.get("redirect_uri") || "/");
      redirectUrl.searchParams.set("github_token", tokenData.access_token);

      return Response.redirect(redirectUrl.toString(), 302);
    }

    // Authorization endpoint — redirect to GitHub
    if (url.pathname === "/auth") {
      const params = new URLSearchParams({
        client_id: id,
        redirect_uri: url.origin + "/callback",
        scope: "repo",
        state: url.searchParams.get("state") || "",
      });
      return Response.redirect("https://github.com/login/oauth/authorize?" + params.toString(), 302);
    }

    // Catch-all — pass through to Decap CMS frontend
    return new Response("OK", { headers: { "Content-Type": "text/plain" } });
  },
};
