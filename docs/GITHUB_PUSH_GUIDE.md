# GitHub 推送完整命令

## 前提条件

确保已安装以下工具：
- **Git**：https://git-scm.com/download/win
- **GitHub 账号**：https://github.com/signup（没有就注册一个）

安装 Git 后，**重启 PowerShell** 再执行下面的命令。

---

## 第一步：确认项目路径

```powershell
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform
pwd
```

确认输出是项目根目录。

---

## 第二步：初始化 Git 仓库

```powershell
git init
git add .
git status
```

`git status` 应该显示大量待提交的文件（约 1400+ 个），其中 `node_modules/` 和 `dist/` 会被 `.gitignore` 排除在外。

---

## 第三步：配置 Git 用户信息（替换为你的信息）

```powershell
git config --global user.name "你的名字"
git config --global user.email "你的邮箱@example.com"
```

---

## 第四步：提交代码

```powershell
git commit -m "初始版本：XX县国有资产招租平台"
```

---

## 第五步：在 GitHub 创建仓库并推送

### 方式 A：使用 GitHub CLI（推荐，如果已安装 `gh`）

```powershell
gh auth login   # 按提示登录 GitHub
gh repo create asset-rental-platform --public --push --source=. --branch=main
```

### 方式 B：手动创建 + 推送（通用）

1. 浏览器打开 https://github.com/new
2. **Repository name** 填写：`asset-rental-platform`
3. 选择 **Public**
4. **不要**勾选"Add a README"等选项（项目已有这些文件）
5. 点 **Create repository**
6. 创建成功后，GitHub 会显示一行命令，类似：

```bash
git remote add origin https://github.com/你的用户名/asset-rental-platform.git
git branch -M main
git push -u origin main
```

7. 在 PowerShell 中执行这几行（把 `你的用户名` 换成你的实际 GitHub 用户名）：

```powershell
git remote add origin https://github.com/你的用户名/asset-rental-platform.git
git branch -M main
git push -u origin main
```

---

## 第六步：验证推送成功

```powershell
git log --oneline -3
git remote -v
```

浏览器打开 https://github.com/你的用户名/asset-rental-platform 确认文件已上传。

---

## 常见问题

### Q: 推送时提示 "Authentication failed"
**解决**：使用 Personal Access Token 而不是密码：
```powershell
# 生成 Token：https://github.com/settings/tokens → New (classic) → 勾选 repo 权限
git remote set-url origin https://你的用户名:你的Token@github.com/你的用户名/asset-rental-platform.git
git push -u origin main
```

### Q: 提示 "This repository moved. Please use the new location"
**解决**：更新远程地址：
```powershell
git remote set-url origin https://github.com/正确用户名/asset-rental-platform.git
git push -u origin main
```

### Q: 中文路径导致 Git 报错
**解决**：设置 Git 支持 UTF-8 路径：
```powershell
git config --global core.quotepath false
git config --global core.longpaths true
```

### Q: 文件太多推送慢
**解决**：首次推送正常即可，后面只推送变更：
```powershell
git add .
git commit -m "更新描述"
git push
```

---

## 推送完成后，回到这里继续下一步

推送成功后告诉我，我帮你：
1. 生成 Cloudflare Worker 的 OAuth 代理代码
2. 创建 GitHub OAuth App 的完整指引
3. Cloudflare Pages 部署步骤
