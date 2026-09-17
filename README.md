# XX县国有资产招租信息平台

完全免费、可浏览器后台维护、手机适配的国有资产招租展示平台。

## 技术架构

| 层 | 技术 | 费用 |
|---|---|---|
| 静态站点 | Astro（静态生成） | 免费 |
| 可视化后台 | Decap CMS v3（开源） | 免费 |
| 内容仓库 | GitHub（Public） | 免费 |
| 托管与 CDN | Cloudflare Pages | 免费（无限带宽） |
| OAuth 认证代理 | Cloudflare Worker | 免费 |

**年费用：0 元**。

## 功能清单

- 资产卡片网格展示（房屋/商铺/办公楼/土地），支持三图展示与同页详情展开
- 关键词搜索、类型筛选、面积区间筛选（房屋/商铺 & 土地独立区间）
- 多种排序（默认发布时间倒序 / 面积升序 / 面积降序 / 名称排序）
- 收藏（localStorage，本机持久化）
- 分享（Web Share API / Clipboard）
- 海报生成（html2canvas 一键导出 PNG，可直接在微信/群里转发）
- 打印（调用浏览器打印）
- 公告通知（支持置顶、Markdown 正文）
- 公司简介（Markdown 编辑）
- 联系方式页
- 响应式布局（桌面 3 列 / 平板 2 列 / 手机 1 列）

## 目录结构

```
asset-rental-platform/
├── public/
│   ├── admin/              # Decap CMS 入口页与配置文件
│   │   ├── index.html
│   │   └── config.yml
│   ├── favicon.ico
│   └── images/uploads/     # 后台上传图片的存放目录
├── src/
│   ├── content/
│   │   ├── config.ts       # Astro 5 内容集合 Schema
│   │   ├── properties/     # 房屋/商铺/办公楼（每项一个 .md）
│   │   ├── lands/          # 土地
│   │   ├── announcements/  # 公告
│   │   └── company/        # 公司简介
│   ├── layouts/BaseLayout.astro
│   ├── components/         # AssetCard / FilterBar / SortControls / AssetDetail / AnnouncementList / ContactSection
│   ├── pages/              # index / assets / about / announcements / contact
│   ├── scripts/actions.js  # 详情页交互、收藏、分享、海报
│   └── styles/global.css
├── scripts/
│   ├── generate-sample-data.mjs   # 生成 50+6 条示例数据
│   └── make-favicon.mjs           # 生成 32x32 favicon.ico
├── astro.config.mjs
├── package.json
├── tsconfig.json
└── README.md
```

## 本地运行

```bash
cd asset-rental-platform
npm install
npm run dev      # 访问 http://localhost:4321
npm run build    # 产物输出到 dist/
npm preview      # 本地预览构建结果
```

### 示例数据说明

仓库自带 **50 项**房屋/商铺/办公楼 + **6 项**土地 + **4 条**公告的示例数据，便于本地预览。
正式启用前请删除示例并录入真实资产：

```bash
rm -rf src/content/properties src/content/lands
npm run gen-sample   # 重新生成示例（调试用）
```

也可直接在后台 `/admin` 中新建资产（图片单张 ≤ 500KB）。

## 部署流程

### 第 1 步：创建 GitHub 仓库

1. 访问 https://github.com/new，仓库名 `asset-rental-platform`，设为 **Public**
2. 将本项目推送至 `main` 分支

### 第 2 步：部署 OAuth 代理（Cloudflare Worker）

Decap CMS 在 Cloudflare Pages 上需自建 OAuth 代理完成 GitHub 认证。

1. Cloudflare Dashboard → **Workers & Pages** → 新建 Worker，使用模板 `sterlingwes/decap-proxy`
2. GitHub 创建 OAuth App：https://github.com/settings/applications/new
   - **Homepage URL**：`https://你的Worker地址.workers.dev`
   - **Authorization callback URL**：`https://你的Worker地址.workers.dev/callback`
3. 将 OAuth App 的 **Client ID** 和 **Client Secret** 填入 Worker 环境变量
   - `GITHUB_OAUTH_ID` → Client ID
   - `GITHUB_OAUTH_SECRET` → Client Secret
4. 记录 Worker 地址（如 `https://my-proxy.workers.dev`）

### 第 3 步：修改配置

编辑以下文件，将占位符替换为你的实际地址：

**`public/admin/config.yml`**
```yaml
backend:
  repo: your-github-username/asset-rental-platform
  base_url: https://your-proxy.workers.dev
```

**`astro.config.mjs`**
```js
site: 'https://your-project.pages.dev',
```

### 第 4 步：部署到 Cloudflare Pages

1. Cloudflare Dashboard → **Workers & Pages** → **Create application** → **Pages** → **Connect to Git**
2. 选择你的 GitHub 仓库
3. 构建配置：
   - Framework preset：**Astro**
   - Build command：`npm run build`
   - Build output directory：`dist`
4. 点击 **Save and Deploy**

部署成功后，访问 `https://你的项目名.pages.dev` 即可。后台地址为 `https://你的项目名.pages.dev/admin`。

### 第 5 步：开启自动构建

在 **Settings → Builds & deployments** 中确认已开启 **Auto-deploy**。此后维护人员在后台保存内容时，会自动触发 Pages 重新构建，约 1–2 分钟生效。

## 维护人员操作流程

1. 浏览器打开 `https://你的项目名.pages.dev/admin`
2. 点击 **Login with GitHub**，授权登录
3. 左侧菜单：
   - **房屋与商铺** — 新建/编辑房屋、商铺、办公楼
   - **土地** — 新建/编辑土地
   - **公告通知** — 新建公告（可置顶）
   - **公司简介** — 编辑公司标题与正文
4. 填写表单 → 上传图片（≤ 500KB/张）→ **Publish**
5. 网站自动更新，无需触碰代码

## 常见问题

| 问题 | 排查方法 |
|---|---|
| `/admin` 打开后白屏 | 打开浏览器控制台（F12），查看 Network/Console 错误；常见原因：`config.yml` 的 `repo` 或 `base_url` 未正确填写 |
| GitHub 登录失败 | 检查 OAuth App 的 **Authorization callback URL** 是否为 `https://你的Worker地址.workers.dev/callback`；仓库必须是 Public |
| 图片上传失败 | 单张图片体积 ≤ 500KB（约 2MP 像素以内）；超大的图片请先用压缩工具处理 |
| 构建失败 | 查看 Cloudflare Pages 的 **Deployment logs**；最常见原因是 `config.ts` 字段与 .md frontmatter 不一致 |
| 国内访问速度慢 | 注册腾讯云 EdgeOne 免费版，源站填 `你的项目名.pages.dev`，配置 CNAME 加速（仍 0 元） |
| 删除某项资产 | 在 `/admin` 打开对应条目 → 点击底部 **Delete** → Publish |

## 免责声明

平台展示的资产招租信息仅供参考，具体租赁条件、竞价规则及最终结果以正式公告为准。
