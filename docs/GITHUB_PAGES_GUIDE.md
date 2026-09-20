# 方案 B — GitHub Pages 完整部署（mrg195）

## 当前状态
- ✅ 代码已推送（需你先完成 Token 授权推送）
- ✅ config.yml 已修改为直连 GitHub 模式
- ✅ astro.config.mjs 已更新 site 地址

---

## 第三步：开启 GitHub Pages

1. 浏览器打开：https://github.com/mrg195/asset-rental-platform/settings/pages
2. **Source** → 选 **Deploy from a branch**
3. **Branch** → 选 **main**，文件夹选 **/ (root)**
4. 点 **Save**
5. 等约 1 分钟，页面顶部出现：`https://mrg195.github.io/asset-rental-platform`
6. **记住这个地址，第四步要用**

---

## 第四步：创建 GitHub OAuth App（给 /admin 后台用）

1. 浏览器打开：https://github.com/settings/applications/new
2. 填写：

   | 字段 | 值 |
   |---|---|
   | Application name | `Asset Rental Platform` |
   | Homepage URL | `https://mrg195.github.io/asset-rental-platform` |
   | Authorization callback URL | `https://mrg195.github.io/asset-rental-platform/admin/` |

3. 点 **Register application**
4. 复制 **Client ID**（字母+数字）
5. 点 **Generate a new client secret** → 复制 **Client Secret**

---

## 第五步：把 Client ID 写入仓库

在 GitHub 仓库里新建文件：`.github/oauth-credentials.yml`

内容为：
```yaml
client_id: 你的ClientID
client_secret: 你的ClientSecret
```

> ⚠️ 这个文件在 GitHub Pages 上是公开的！所以**不要把真实敏感信息放这里**，实际生产环境应该用环境变量。
> 
> **更安全的做法**：把 Client ID 和 Secret 直接写在 Decap CMS 配置中，但这是公开的。
> 
> 对于这个项目，推荐使用以下方式：

### 推荐：直接在 config.yml 中配置（简单版）

Decap CMS 支持在 config.yml 里直接写 client_id：

打开 `public/admin/config.yml`，在 `backend` 段加上：

```yaml
backend:
  name: github
  repo: mrg195/asset-rental-platform
  branch: main
  auth_type: popup  # 使用弹窗登录模式，不需要单独 OAuth App
```

**这样可以跳过创建 OAuth App 的步骤！**

---

## 简化方案：无需 OAuth App（推荐）⭐

Decap CMS 的 `auth_type: popup` 模式可以直接用 GitHub 登录，不需要创建 OAuth App。

只需修改 `public/admin/config.yml`：

```yaml
backend:
  name: github
  repo: mrg195/asset-rental-platform
  branch: main
  auth_type: popup
```

然后推送即可。后台登录时会弹出 GitHub 授权窗口，无需额外配置。

---

## 第六步：推送所有更改

```powershell
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform
git add .
git commit -m "配置GitHub Pages和后台登录"
git push
```

---

## 第七步：验证

1. 访问前台：https://mrg195.github.io/asset-rental-platform
2. 访问后台：https://mrg195.github.io/asset-rental-platform/admin
3. 点击 Login with GitHub，授权后应该能看到后台界面

---

## 常见问题

| 问题 | 解决方法 |
|---|---|
| 网站打不开 | 等 1-2 分钟，GitHub Pages 构建需要时间 |
| /admin 白屏 | 检查 config.yml 的 repo 和 branch 是否正确 |
| GitHub 登录弹窗报错 | 需要在 GitHub 创建 OAuth App，见上方第四步 |
