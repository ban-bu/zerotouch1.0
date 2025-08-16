# 🚄 Railway 快速部署

## 5分钟部署到 Railway

### 1️⃣ 准备工作
确保你有：
- GitHub 账号
- Railway 账号 (免费注册 [railway.app](https://railway.app))

### 2️⃣ 一键部署

[![Deploy on Railway](https://railway.app/button.svg)](https://railway.app/template/zerotouch-services)

或者手动步骤：

```bash
# 1. 克隆项目
git clone <your-repo-url>
cd zerotouch

# 2. 安装 Railway CLI
npm install -g @railway/cli

# 3. 登录 Railway
railway login

# 4. 初始化项目
railway init

# 5. 部署
railway up
```

### 3️⃣ 配置环境变量（可选）

在 Railway 控制台设置：
```
NODE_ENV=production
VITE_APP_TITLE=我的ZeroTouch应用
```

### 4️⃣ 访问应用

部署完成后，Railway 会提供一个自动生成的 URL，例如：
`https://zerotouch-production-xxxx.up.railway.app`

### 🎯 完成！

你的应用现在已经运行在 Railway 上，支持：
- ✅ 自动 HTTPS
- ✅ 自动部署（Git 推送触发）
- ✅ 监控和日志
- ✅ 健康检查

---

💡 **提示**: 查看 [完整部署指南](./RAILWAY_DEPLOYMENT.md) 了解更多高级配置。
