# ZeroTouch Services - Railway 部署指南

本指南将帮助你在 Railway 平台上部署 ZeroTouch Services 应用。

## 🚀 快速部署

### 方法一：通过 Railway CLI（推荐）

1. **安装 Railway CLI**
   ```bash
   npm install -g @railway/cli
   ```

2. **登录 Railway**
   ```bash
   railway login
   ```

3. **初始化项目**
   ```bash
   railway init
   ```

4. **部署应用**
   ```bash
   railway up
   ```

### 方法二：通过 Railway 网页界面

1. 访问 [Railway](https://railway.app) 并登录
2. 点击 "New Project"
3. 选择 "Deploy from GitHub repo"
4. 选择你的 ZeroTouch Services 仓库
5. Railway 会自动检测 `railway.toml` 配置并开始部署

## 📋 部署前准备

### 1. 确保文件存在
确保以下文件存在于项目根目录：
- `railway.toml` - Railway 配置文件
- `Dockerfile.railway` - Railway 专用 Dockerfile
- `nginx.railway.conf.template` - Nginx 配置模板

### 2. 环境变量配置
参考 `railway.env.example` 文件，在 Railway 控制台设置必要的环境变量：

```
NODE_ENV=production
VITE_APP_TITLE=ZeroTouch Services
```

## ⚙️ 配置说明

### Railway 配置 (railway.toml)
- **构建器**: 使用 Dockerfile
- **Dockerfile**: `Dockerfile.railway`
- **健康检查**: `/health` 端点
- **重启策略**: 总是重启

### Docker 配置
- **多阶段构建**: 构建阶段 + Nginx 生产阶段
- **动态端口**: 使用 Railway 提供的 `$PORT` 环境变量
- **静态文件服务**: 通过 Nginx 托管

### Nginx 配置
- **动态端口监听**: 使用环境变量替换
- **Gzip 压缩**: 启用
- **安全头部**: 配置完整的安全头部
- **SPA 路由**: 支持 React Router
- **静态资源缓存**: 1年缓存期

## 🔧 本地测试

### 测试 Railway Dockerfile
```bash
# 构建镜像
npm run docker:build:railway

# 运行容器
npm run docker:run:railway

# 访问应用
open http://localhost:3000
```

### 测试 Railway 构建
```bash
# 模拟 Railway 构建过程
npm run railway:build
```

## 📊 监控和维护

### 健康检查
应用提供 `/health` 端点用于健康检查：
```bash
curl https://your-app.railway.app/health
```

### 日志查看
```bash
# 使用 Railway CLI 查看日志
railway logs

# 实时日志
railway logs --follow
```

### 部署状态
```bash
# 查看部署状态
railway status

# 查看环境信息
railway environment
```

## 🌍 环境变量

### Railway 自动设置的变量
- `PORT`: 应用监听端口
- `RAILWAY_ENVIRONMENT`: 环境名称
- `RAILWAY_PROJECT_NAME`: 项目名称
- `RAILWAY_SERVICE_NAME`: 服务名称

### 自定义变量
在 Railway 控制台或通过 CLI 设置：
```bash
railway variables set NODE_ENV=production
railway variables set VITE_APP_TITLE="ZeroTouch Services"
```

## 🔄 更新部署

### 自动部署
推送到连接的 Git 分支会自动触发部署。

### 手动部署
```bash
railway up
```

### 回滚部署
```bash
railway rollback
```

## 🐛 故障排除

### 常见问题

1. **构建失败**
   - 检查 `package.json` 依赖
   - 确保 `Dockerfile.railway` 语法正确
   - 查看构建日志：`railway logs`

2. **应用无法访问**
   - 确认应用监听 `0.0.0.0:$PORT`
   - 检查 nginx 配置中的端口设置
   - 验证健康检查端点

3. **静态资源404**
   - 确认构建产物位于 `/usr/share/nginx/html`
   - 检查 nginx 配置中的 root 路径

### 调试命令
```bash
# 查看服务状态
railway status

# 查看环境变量
railway variables

# 查看详细日志
railway logs --since 1h

# 连接到容器（如果支持）
railway shell
```

## 📚 相关资源

- [Railway 官方文档](https://docs.railway.app)
- [Railway CLI 文档](https://docs.railway.app/develop/cli)
- [Dockerfile 最佳实践](https://docs.docker.com/develop/dev-best-practices/)
- [Nginx 配置指南](https://nginx.org/en/docs/)

## 🤝 支持

如果遇到问题，请：
1. 查看 Railway 控制台的部署日志
2. 检查项目的 GitHub Issues
3. 参考 Railway 社区文档

---

**注意**: 确保在生产环境中设置适当的环境变量和安全配置。
