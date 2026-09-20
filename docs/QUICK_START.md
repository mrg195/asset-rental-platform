# XX县国有资产招租平台 — 快速部署指南

## 当前状态
- ✅ GitHub 仓库已创建：https://github.com/mrg195/asset-rental-platform
- ✅ 项目文件已全部就绪

---

## Cloudflare Workers & Pages 无法访问？

如果你打开 https://dash.cloudflare.com/workers 或 https://dash.cloudflare.com/pages 显示 **"Page not found"**，说明你的 Cloudflare 账户**还没有启用 Workers & Pages 功能**。

### 解决方法（任选其一）

#### 方法 A：在 Cloudflare 内启用（推荐，继续用原方案）
1. 打开 https://dash.cloudflare.com
2. 点击左上角 **☰ 菜单** → 找 **More** 或 **更多产品**
3. 搜索 `Workers` 或 `Pages`
4. 点击 **Get started** / **启用**
5. 启用后直接访问：
   - Workers：https://dash.cloudflare.com/workers
   - Pages：https://dash.cloudflare.com/pages

#### 方法 B：换用 GitHub Pages（最简单，无需 Cloudflare）
如果你的 Cloudflare 账户确实没有 Workers/Pages，改用 **GitHub Pages** 完全免费：
- 不需要 Cloudflare 账号
- 不需要 Worker 代理
- Decap CMS 直接连 GitHub，无需 OAuth
- 只需要在 GitHub 仓库设置里开启 Pages 即可

---

## 方案一：继续用 Cloudflare（需要先启用功能）

### 启用步骤
1. 浏览器打开 https://dash.cloudflare.com
2. 点击右上角你的头像 → **View all accounts**
3. 确认你选的是一个**域名账户**（不是个人账户）
4. 左侧菜单找 **Workers & Pages**（闪电图标 ⚡）
5. 如果找不到，点顶部搜索框输入 `workers` 回车

### 创建 Worker（OAuth 代理）
1. Workers & Pages → **Create application** → **Worker**
2. 名称填：`asset-rental-platform-proxy`
3. **From a template** → 搜索 `decap-proxy` → 选 `sterlingwes/decap-proxy`
4. **Deploy**

### 创建 GitHub OAuth App
1. https://github.com/settings/applications/new
2. 填写：
   - Application name: `Asset Rental Platform`
   - Homepage URL: `https://你的Worker地址.workers.dev`
   - Authorization callback URL: `https://你的Worker地址.workers.dev/callback`
3. 注册后复制 **Client ID** 和 **Client Secret**
4. Worker 的 Settings → Variables 填入这两个值

### 部署到 Pages
1. Workers & Pages → **Create application** → **Pages**
2. **Connect to Git** → 选 `mrg195/asset-rental-platform`
3. 构建设置：
   - Build command: `npm run build`
   - Build output: `dist`
   - Framework preset: **Astro**
4. **Save and Deploy**

---

## 方案二：改用 GitHub Pages（推荐，更简单）

### 优势
- 不需要 Cloudflare
- 不需要 Worker 代理
- Decap CMS 原生支持 GitHub，开箱即用
- 完全免费

### 步骤

#### 1. 修改 Decap CMS 配置

打开 `public/admin/config.yml`，把后端改为纯 GitHub 模式：

```yaml
backend:
  name: github
  repo: mrg195/asset-rental-platform
  branch: main
  # 移除 base_url 和 auth_endpoint 这两行（不再需要 Worker）
```

#### 2. 在 GitHub 仓库中启用 Pages

1. 打开 https://github.com/mrg195/asset-rental-platform/settings/pages
2. Source 选 **Deploy from a branch**
3. Branch 选 **main**，文件夹选 **/docs**（或 /）
4. 点 **Save**

#### 3. 配置 Decap CMS 访问权限

Decap CMS 需要读取/写入仓库内容的权限：
1. 打开 https://github.com/settings/applications/new
2. 填写：
   - Application name: `Asset Rental CMS`
   - Homepage URL: `https://mrg195.github.io/asset-rental-platform`
   - Authorization callback URL: `https://mrg195.github.io/asset-rental-platform/admin/`
3. 勾选权限：**repo**（完整控制私有仓库）
4. 注册后获取 **Client ID** 和 **Client Secret**

#### 4. 在仓库中添加 Decap CMS 配置

在 GitHub 仓库根目录创建文件 `.decapcms/config.yml`，内容与 `public/admin/config.yml` 相同。

#### 5. 更新 astro.config.mjs

```js
site: 'https://mrg195.github.io/asset-rental-platform',
```

推送所有更改：
```powershell
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform
git add .
git commit -m "切换到 GitHub Pages 部署"
git push
```

#### 6. 访问网站
- 前台：https://mrg195.github.io/asset-rental-platform
- 后台：https://mrg195.github.io/asset-rental-platform/admin

---

## 两种方案对比

| 项目 | Cloudflare | GitHub Pages |
|---|---|---|
| 国内访问速度 | 一般（可加 EdgeOne 加速） | 较慢 |
| 需要额外服务 | Worker + OAuth App | 无 |
| 配置复杂度 | 中等 | 简单 |
| 费用 | 0 元 | 0 元 |
| 推荐度 | ⭐⭐⭐ | ⭐⭐⭐⭐⭐ |

---

## 建议

**如果你只是想快速上线**：用方案二（GitHub Pages），10 分钟搞定。  
**如果你需要更好的国内访问速度**：先用 GitHub Pages 上线，后续再加腾讯云 EdgeOne 加速。

请告诉我你选择哪个方案，我继续指导你！
