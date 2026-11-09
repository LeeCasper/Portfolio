# 管理端（SoybeanAdmin）

个人作品集的内容管理后台，基于 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin) 2.x
（Vue 3 + Vite Plus + Naive UI + UnoCSS）改造，独立于 Astro 公开站点部署。

## 与后端的对接方式

| 项 | 说明 |
|---|---|
| 后端 | Spring Boot，默认 `http://localhost:8081` |
| 认证 | 单 Token：登录页输入后端 `CONTENT_ADMIN_TOKEN`，请求带 `X-ADMIN-TOKEN` 头 |
| 响应格式 | 直接消费后端原生 JSON（没有 `{ code, data, msg }` 包络） |
| 路由 | 静态路由（`VITE_AUTH_ROUTE_MODE=static`），登录后固定角色 `R_SUPER` 放行全部菜单 |
| 开发代理 | 请求 `/proxy-default/**` → `VITE_SERVICE_BASE_URL`（见 `build/config/proxy.ts`） |

关键改造文件：

- `src/service/request/index.ts`：原生 JSON、`X-ADMIN-TOKEN`、FormData、401 登出
- `src/store/modules/auth/index.ts`：Token 登录与本地校验，固定管理员身份
- `src/service/api/portfolio.ts`：项目 / 文章 / 作品 / 个人信息 / 上传接口
- `src/views/{dashboard,projects,posts,works,profile}/`：业务页面
- `build/plugins/router.ts`：菜单图标与顺序

## 本地开发

```bash
# 先启动后端（必须提供 Token）
cd ../backend
CONTENT_ADMIN_TOKEN=your-token mvn spring-boot:run

# 再启动管理端
pnpm install --frozen-lockfile
pnpm dev          # http://localhost:9530
```

开发环境读取 `.env` + `.env.test`；生产构建读取 `.env` + `.env.prod`。

## 常用命令

```bash
pnpm dev          # 开发服务器（9530）
pnpm typecheck    # 类型检查
pnpm build        # 生产构建，产物在 dist/
pnpm lint         # ESLint + Vite Plus 检查
```

新增页面时：在 `src/views/<name>/index.vue` 建文件 → 运行一次 `pnpm dev` 让
`@elegant-router/vue` 生成路由文件 → 补充 `src/locales/langs/*` 的 `route.<name>` 文案。
生成的路由文件需要一并提交。

## 部署

`pnpm build` 后将 `dist/` 作为静态站点发布（history 模式需回退到 `index.html`）。
构建前在 `.env.prod` 中设置 `VITE_SERVICE_BASE_URL` 为生产后端地址，并确保后端
`PUBLIC_ADMIN_ORIGIN` 允许管理端域名。

## 上游与许可

本目录基于 SoybeanAdmin（MIT）修改，原项目地址：
<https://github.com/soybeanjs/soybean-admin>，许可证见本目录 `LICENSE`。
