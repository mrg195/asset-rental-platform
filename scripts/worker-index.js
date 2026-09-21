// Cloudflare Worker: Decap CMS GitHub OAuth 代理
// 部署后需要配置两个 secret:
//   npx wrangler secret put GITHUB_OAUTH_CLIENT_ID
//   npx wrangler secret put GITHUB_OAUTH_CLIENT_SECRET
// 访问路径:
//   /auth     -> Decap 弹窗入口，跳转 GitHub 授权
//   /callback -> GitHub 回调，换取 token 并 postMessage 回 CMS

const JSON_HEADERS = { "Content-Type": "application/json; charset=utf-8" };

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    // ---------- /auth : 跳转 GitHub 授权 ----------
    if (url.pathname === "/auth") {
      const siteId = url.searchParams.get("site_id") || "mrg195.github.io";
      const scope = url.searchParams.get("scope") || "repo";
      const params = new URLSearchParams({
        client_id: env.GITHUB_OAUTH_CLIENT_ID,
        redirect_uri: `${url.origin}/callback`,
        scope: scope,
        state: siteId,
      });
      return Response.redirect(
        `https://github.com/login/oauth/authorize?${params.toString()}`,
        302
      );
    }

    // ---------- /callback : 换取 token 并回传 CMS ----------
    if (url.pathname === "/callback") {
      const code = url.searchParams.get("code");
      if (!code) {
        return new Response("缺少 code 参数", { status: 400, headers: JSON_HEADERS });
      }

      const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
        method: "POST",
        headers: { "Content-Type": "application/json", Accept: "application/json" },
        body: JSON.stringify({
          client_id: env.GITHUB_OAUTH_CLIENT_ID,
          client_secret: env.GITHUB_OAUTH_CLIENT_SECRET,
          code: code,
        }),
      });
      const data = await tokenRes.json().catch(() => ({}));

      if (!data.access_token) {
        return new Response(
          "GitHub 授权失败: " + JSON.stringify(data),
          { status: 400, headers: JSON_HEADERS }
        );
      }

      // 与 Decap CMS 的弹窗握手：postMessage 给打开弹窗的窗口
      const cmsOrigin = "https://" + (url.searchParams.get("state") || "mrg195.github.io");
      const token = data.access_token;
      const html = `<!DOCTYPE html>
<html lang="zh-CN">
<body style="font-family:sans-serif;text-align:center;padding-top:80px;">
  <p>授权成功，正在返回后台...</p>
  <script>
    (function () {
      var token = ${JSON.stringify(token)};
      var origin = ${JSON.stringify(cmsOrigin)};
      if (window.opener) {
        window.opener.postMessage({ token: token, provider: "github" }, origin);
      }
      document.body.innerText = "授权成功，请关闭此窗口返回后台。";
      setTimeout(function () { window.close(); }, 600);
    })();
  <\/script>
</body>
</html>`;
      return new Response(html, {
        headers: { "Content-Type": "text/html; charset=utf-8" },
      });
    }

    // ---------- 其他路径 ----------
    return new Response("Decap OAuth Worker 运行中。", { headers: JSON_HEADERS });
  },
};
