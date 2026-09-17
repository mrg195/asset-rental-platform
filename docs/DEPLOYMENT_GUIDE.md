# XX县国有资产招租平台 — GitHub 推送 & Cloudflare 部署完整指南

> GitHub 用户名：mrg023  
> 项目仓库：https://github.com/mrg023/asset-rental-platform

---

## 第一部分：推送到 GitHub

### 前置条件
- ✅ Git 已安装（https://git-scm.com/download/win）
- ✅ GitHub 账号已注册（https://github.com/signup）

### 执行命令（复制到 PowerShell）

```powershell
# 进入项目目录
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform

# 初始化并提交
git init
git add .
git config --global user.name 'mrg023'
git config --global user.email '你的邮箱@example.com'
git commit -m "初始版本：XX县国有资产招租平台"

# 关联远程仓库并推送
git remote add origin https://github.com/mrg023/asset-rental-platform.git
git branch -M main
git push -u origin main
```

### 推送成功后
浏览器打开 → https://github.com/mrg023/asset-rental-platform  
确认文件已上传（应该看到 ~50 个文件）。

---

## 第二部分：创建 Cloudflare Worker（OAuth 代理）

### 第 1 步：登录 Cloudflare
1. 打开 https://dash.cloudflare.com
2. 登录或注册（支持 GitHub 一键登录，免费）

### 第 2 步：创建 Worker
1. 左侧菜单 → **Workers & Pages**
2. 点 **Create application** → 选 **Worker**
3. **From template** → 搜索 `decap-proxy` → 选 `sterlingwes/decap-proxy`
4. 点 **Deploy**
5. 部署完成后记录 Worker 地址，格式如：`https://asset-rental-platform-worker-xxx.workers.dev`

### 第 3 步：创建 GitHub OAuth App
1. 打开 https://github.com/settings/applications/new
2. 填写：
   | 字段 | 值 |
   |---|---|
   | Application name | `Asset Rental Platform` |
   | Homepage URL | `https://你的Worker地址.workers.dev` |
   | Authorization callback URL | `https://你的Worker地址.workers.dev/callback` |
3. 点 **Register application**
4. 复制页面显示的 **Client ID**
5. 点 **Generate a new client secret** → 复制 **Client Secret**

### 第 4 步：填入 Worker 环境变量
1. 回到 Cloudflare Dashboard → 你的 Worker → **Settings** → **Variables**
2. 点 **Add variable**，添加以下两个：

| Variable name | Value |
|---|---|
| `GITHUB_OAUTH_ID` | 填入第3步复制的 Client ID |
| `GITHUB_OAUTH_SECRET` | 填入第3步复制的 Client Secret |

3. 点 **Save and deploy**

### 验证 OAuth 代理
浏览器打开：`https://你的Worker地址.workers.dev/auth`  
如果跳转到 GitHub 登录页面，说明配置成功。

---

## 第三部分：修改项目配置并重新推送

### 修改 `public/admin/config.yml`

用记事本或 VS Code 打开，找到这两行并修改：

```yaml
# 第4行 — 改为你的 GitHub 用户名和仓库名
repo: mrg023/asset-rental-platform

# 第6行 — 填入你的 Worker 地址
base_url: https://你的Worker地址.workers.dev
```

### 修改 `astro.config.mjs`

```js
// TODO: 等 Pages 部署后再改，先保持原样或填一个占位地址
site: 'https://asset-rental-platform.pages.dev',
```

### 推送配置更新

```powershell
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform
git add public/admin/config.yml astro.config.mjs
git commit -m "更新 CMS 配置"
git push
```

---

## 第四部分：部署到 Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages**
2. **Connect to Git** → 选择 `mrg023/asset-rental-platform`
3. 填写构建设置：

   | 字段 | 值 |
   |---|---|
   | Production branch | `main` |
   | Build command | `npm run build` |
   | Build output directory | `dist` |
   | Framework preset | **Astro** |

4. 点 **Save and Deploy**
5. 等待 1-2 分钟，部署成功后记录地址（如 `https://asset-rental-platform.pages.dev`）

### 更新 `astro.config.mjs`

```js
site: 'https://asset-rental-platform.pages.dev',  // 改成你的实际地址
```

推送：
```powershell
git add astro.config.mjs && git commit -m "更新 site 地址" && git push
```

---

## 第五部分：首次使用后台

1. 浏览器打开 `https://你的项目名.pages.dev/admin`
2. 点击 **Login with GitHub** 授权
3. 左侧菜单开始录入资产：
   - **房屋与商铺** → 新建 → 填写信息 → 上传图片 → Publish
   - **土地** → 同上
   - **公告通知** → 新建公告（可置顶）
   - **公司简介** → 编辑

4. 每张图片 ≤ **500KB**（超大的图用 [tinypng.com](https://tinypng.com) 压缩后再上传）

---

## 常见问题

| 问题 | 解决方法 |
|---|---|
| 推送时 "Authentication failed" | 用 Personal Access Token：https://github.com/settings/tokens → 选 repo 权限 → 生成 → 用 token 代替密码 |
| `/admin` 白屏 | F12 看 Console，通常是 `repo` 或 `base_url` 填错了 |
| 图片上传失败 | 单张 ≤ 500KB，用 tinypng.com 压缩后再传 |
| 构建失败 | 检查 Cloudflare Pages 的 Deployment logs，最常见原因是 config.ts 字段与 .md frontmatter 不一致 |
| 国内访问慢 | 注册腾讯云 EdgeOne 免费版（源站填 pages.dev 地址），仍然 0 元 |

---

## 需要帮助？

把遇到的问题发给我，我帮你排查。
