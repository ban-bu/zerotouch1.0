# ZeroTouch 系统部署指南

## 📋 部署前检查清单

### 系统要求
- Node.js 18+ 
- npm 或 yarn
- 现代浏览器支持 (Chrome 90+, Firefox 88+, Safari 14+)

### 环境变量配置
创建 `.env` 文件并配置以下变量：
```bash
# API配置
VITE_API_BASE_URL=https://your-api-domain.com
VITE_WEBSOCKET_URL=wss://your-websocket-domain.com

# LLM服务配置
VITE_LLM_API_KEY=your-llm-api-key
VITE_LLM_MODEL=gpt-4

# 应用配置
VITE_APP_NAME=ZeroTouch
VITE_APP_VERSION=1.0.0
```

## 🚀 部署步骤

### 1. 本地构建测试
```bash
# 安装依赖
npm install

# 运行测试
node test-system.cjs

# 本地开发服务器
npm run dev

# 生产构建
npm run build

# 预览生产构建
npm run preview
```

### 2. 静态部署 (推荐)

#### Vercel 部署
```bash
# 安装 Vercel CLI
npm i -g vercel

# 部署
vercel --prod
```

#### Netlify 部署
```bash
# 安装 Netlify CLI
npm i -g netlify-cli

# 构建并部署
npm run build
netlify deploy --prod --dir=dist
```

#### GitHub Pages 部署
1. 在 `vite.config.js` 中设置 `base: '/your-repo-name/'`
2. 构建项目: `npm run build`
3. 将 `dist` 文件夹内容推送到 `gh-pages` 分支

#### Railway 部署 (推荐云部署)
```bash
# 安装 Railway CLI
npm install -g @railway/cli

# 登录 Railway
railway login

# 初始化项目
railway init

# 部署应用
railway up
```

Railway 特点：
- 自动从 Git 仓库部署
- 支持自定义域名和 HTTPS
- 内置监控和日志
- 零配置数据库服务

详细部署指南请参考: [RAILWAY_DEPLOYMENT.md](./RAILWAY_DEPLOYMENT.md)

### 3. 服务器部署

#### Nginx 配置示例
```nginx
server {
    listen 80;
    server_name your-domain.com;
    
    root /var/www/zerotouch/dist;
    index index.html;
    
    # 处理 SPA 路由
    location / {
        try_files $uri $uri/ /index.html;
    }
    
    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
    
    # Gzip 压缩
    gzip on;
    gzip_types text/css application/javascript application/json;
}
```

#### Docker 部署
创建 `Dockerfile`:
```dockerfile
# 构建阶段
FROM node:18-alpine as builder
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
RUN npm run build

# 生产阶段
FROM nginx:alpine
COPY --from=builder /app/dist /usr/share/nginx/html
COPY nginx.conf /etc/nginx/nginx.conf
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]
```

## 🔧 性能优化

### 构建优化
- 启用代码分割和懒加载
- 压缩图片和静态资源
- 使用 CDN 加速静态资源

### 运行时优化
- 启用 Service Worker 缓存
- 实现预加载关键资源
- 优化首屏加载时间

## 📊 监控和维护

### 性能监控
- 使用 Google Analytics 或类似工具
- 监控页面加载时间
- 跟踪用户交互指标

### 错误监控
- 集成 Sentry 或类似错误追踪服务
- 设置错误报警机制
- 定期检查错误日志

### 更新维护
- 定期更新依赖包
- 监控安全漏洞
- 备份重要配置文件

## 🔒 安全配置

### HTTPS 配置
- 使用 Let's Encrypt 免费 SSL 证书
- 配置 HSTS 头部
- 启用 CSP (Content Security Policy)

### API 安全
- 实现 API 密钥管理
- 配置 CORS 策略
- 限制请求频率

## 📝 部署检查清单

- [ ] 环境变量配置完成
- [ ] 生产构建成功
- [ ] 所有测试通过
- [ ] HTTPS 配置正确
- [ ] 域名解析正确
- [ ] 静态资源加载正常
- [ ] API 连接正常
- [ ] 错误监控配置
- [ ] 性能监控配置
- [ ] 备份策略制定

## 🆘 故障排除

### 常见问题
1. **白屏问题**: 检查控制台错误，通常是路径配置问题
2. **API 连接失败**: 检查 CORS 配置和环境变量
3. **样式丢失**: 检查静态资源路径配置
4. **路由不工作**: 确保服务器配置了 SPA 回退

### 调试工具
- 浏览器开发者工具
- Network 面板检查资源加载
- Console 面板查看错误信息
- Lighthouse 性能分析

---

**部署完成后，请访问您的域名验证所有功能正常工作！** 🎉