# 推送失败排查：Git 认证问题

## 问题
`git push` 报 `SEC_E_NO_CREDENTIALS`，说明本地 Git 没有保存 GitHub 登录凭证。

---

## 解决方法（选一种）

### 方法 A：用 GitHub CLI 登录（最干净）

```powershell
# 1. 先安装 GitHub CLI
winget install --id GitHub.cli -e

# 2. 登录（会打开浏览器授权）
gh auth login
# 按提示选：GitHub.com → HTTPS → 登录网页 → 复制验证码

# 3. 再推送
git push -u origin main
```

---

### 方法 B：用 Personal Access Token（推荐，不用装任何东西）

**Step 1 — 生成 Token**
1. 浏览器打开：https://github.com/settings/tokens/new
2. 填写：
   - Note: `asset-rental-platform`
   - Expiration: `No expiration`（或你选的日期）
   - Select scopes: 勾选 **repo**（全选）
3. 点 **Generate token**
4. **复制生成的 Token**（只显示一次！）

**Step 2 — 更新远程地址（把 Token 嵌进去）**

```powershell
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform

# 把下面的 YOUR_TOKEN 替换成你刚才复制的 Token
git remote set-url origin https://mrg195:YOUR_TOKEN@github.com/mrg195/asset-rental-platform.git

git push -u origin main
```

**Step 3 — 完成后清除 Token（可选，安全建议）**
```powershell
# 推送成功后，把 remote 改回不带 token 的格式
git remote set-url origin https://github.com/mrg195/asset-rental-platform.git
```

---

## 推荐用方法 B，最快

生成 Token 后告诉我，我帮你拼好完整的推送命令。
