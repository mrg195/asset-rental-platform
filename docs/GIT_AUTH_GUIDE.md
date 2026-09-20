# Git 推送授权指南

## 问题
本地没有保存 GitHub 登录凭证，`git push` 无法通过。

---

## 解决方法：使用 Personal Access Token（5 分钟搞定）

### 第 1 步：生成 Token
1. 浏览器打开：**https://github.com/settings/tokens/new**
2. 填写：
   - **Note**：`asset-rental-platform`
   - **Expiration**：`No expiration`
   - **Select scopes**：勾选 ✅ `repo`（全选中）
3. 点底部 **Generate token**
4. **复制生成的 Token**（格式类似 `ghp_xxxxxxxxxxxx`，只显示一次！）

### 第 2 步：执行推送（复制下面整段）

把命令中的 `YOUR_TOKEN_HERE` 替换成你刚才复制的 Token：

```powershell
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform

# 用 Token 更新远程地址
git remote set-url origin https://mrg195:YOUR_TOKEN_HERE@github.com/mrg195/asset-rental-platform.git

# 推送
git push -u origin main
```

### 第 3 步：移除 Token（安全清理，可选）

推送成功后执行：
```powershell
git remote set-url origin https://github.com/mrg195/asset-rental-platform.git
```

---

## 替代方案：安装 GitHub CLI（更简洁）

```powershell
# 安装 GitHub CLI
winget install --id GitHub.cli -e

# 登录（会打开浏览器授权）
gh auth login
# 选：GitHub.com → HTTPS → 登录网页 → 复制验证码 → 回车

# 推送（无需 Token）
cd C:\Users\lenovo\Desktop\可操作文件\asset-rental-platform
git push -u origin main
```

---

## 推荐
**方案 A（Token）** 最快，不需要装任何东西。  
**方案 B（gh）** 更简洁，后续管理仓库也方便。
