# 李聪 · 个人作品集

李聪的个人作品集站点：**Astro 公开站点** + **SoybeanAdmin 管理端** + **Spring Boot 内容后端**。

内容（个人信息、项目、文章、作品）全部通过后台在线维护，保存后公开站点实时读取，无需重新构建。

## 功能

- **公开站点**：首页、关于、博客列表/详情（Markdown + 目录）、作品集、RSS、SEO、暗色模式、响应式
- **管理端**：仪表盘、个人信息、项目、文章、作品管理，支持图片/视频上传
- **认证**：单 Token（`X-ADMIN-TOKEN`），后端未配置 Token 时拒绝启动
- **存储**：SQLite 数据库 + 本地磁盘媒体文件，不依赖云 OSS

## 架构

```
Astro 公开站点 (:5200)        SoybeanAdmin 管理端 (:9530)
          \                        /
             Spring Boot API (:8081)
             /api/public  /api/admin  /api/files
```

生产环境由 Nginx 统一入口：公开站点、管理端静态文件与 `/api` 反向代理。

## 目录结构

```
.
├── src/                  # Astro 公开站点
│   ├── pages/            # 页面路由（/admin 仅保留跳转）
│   ├── components/       # 组件
│   ├── collections/      # 导航、社交链接、经历等静态数据
│   ├── config/site.js    # 站点标题、SEO、作者
│   └── lib/              # 公开 API 客户端
├── admin/                # SoybeanAdmin 管理端（独立 Vue3 SPA）
│   ├── src/views/        # 仪表盘 / 项目 / 文章 / 作品 / 个人信息
│   ├── src/service/      # 后端接口封装
│   └── .env.test/.env.prod
├── backend/              # Spring Boot 内容后端
│   └── src/main/java/com/artaides/portfolio
├── docs/                 # 架构与部署说明
└── storage/              # 运行时生成：SQLite 与媒体文件（已忽略）
```

## 技术栈

| 部分 | 技术 |
|---|---|
| 公开站点 | Astro 5、Tailwind CSS 4、AOS、Lucide |
| 管理端 | SoybeanAdmin 2.x（Vue 3、Vite Plus、Naive UI、UnoCSS） |
| 后端 | Spring Boot 3.3、Spring Data JPA、SQLite、flexmark |
| 工具 | pnpm、Biome、Maven |

## 环境要求

- Node.js **22.18+**（管理端使用的 Vite Plus 要求）
- pnpm **12+**
- Java **21**（若服务器为 JDK 17，可用 `-Djava.version=17` 构建）
- Maven 3.9+

## 本地启动

### 1. 安装依赖

```bash
pnpm install
cd admin && pnpm install --frozen-lockfile && cd ..
```

> 管理端是独立 pnpm workspace，需单独安装；不要随意重算其 lockfile。

### 2. 启动后端

```bash
cd backend
CONTENT_ADMIN_TOKEN=your-token mvn spring-boot:run
# 监听 8081，首次启动自动创建 storage/
```

### 3. 启动公开站点

```bash
cp .env.example .env   # 按需修改
pnpm dev               # http://localhost:5200
```

### 4. 启动管理端

```bash
cd admin
pnpm dev               # http://localhost:9530
```

管理端开发环境通过 Vite 代理访问 `http://localhost:8081`（见 `admin/.env.test`）。

## 环境变量

### 前端（`.env`）

| 变量 | 说明 |
|---|---|
| `PUBLIC_SITE_URL` | 站点地址，用于 canonical / sitemap |
| `PUBLIC_API_BASE_URL` | 后端地址（SSR 使用） |
| `PUBLIC_MEDIA_BASE_URL` | 媒体文件公开地址 |
| `PUBLIC_ADMIN_URL` | 管理端地址，`/admin` 会 302 跳转到这里 |
| `PUBLIC_GA4_ID` / `PUBLIC_UMAMI_ID` | 可选统计 |

### 后端（环境变量）

| 变量 | 说明 |
|---|---|
| `PORT` | 后端端口，默认 8081 |
| `CONTENT_DATA_PATH` | SQLite 所在目录，默认 `storage/data` |
| `CONTENT_STORAGE_ROOT` | 媒体目录，默认 `storage/media` |
| `CONTENT_MEDIA_BASE_URL` | 媒体文件公开 URL |
| `CONTENT_ADMIN_TOKEN` | **必填**，后台登录 Token；未配置时拒绝启动 |
| `PUBLIC_APP_ORIGIN` | 公开站点来源（CORS） |
| `PUBLIC_ADMIN_ORIGIN` | 管理端来源（CORS） |

### 管理端

- `admin/.env.test`：开发环境后端地址（经 Vite 代理）
- `admin/.env.prod`：生产构建的 `VITE_BASE_URL`（默认 `/admin/`）与 `VITE_SERVICE_BASE_URL`（留空表示同源）

## 后台使用

访问管理端地址，在登录页填入 `CONTENT_ADMIN_TOKEN` 即可。Token 保存在浏览器
localStorage（`SOY_token`），刷新无需重输。

## 构建与部署

```bash
# 公开站点（产物 dist/）
pnpm build

# 管理端（产物 admin/dist）
cd admin && pnpm build

# 后端（产物 backend/target/*.jar）
cd backend && mvn clean package -DskipTests
```

生产部署建议：

1. 后端以 systemd 运行，监听 `127.0.0.1:8081`；
2. Astro 以 `node dist/server/entry.mjs` 运行，监听 `127.0.0.1:5200`；
3. 管理端静态文件放到 Nginx 可访问目录，history 模式回退到 `index.html`；
4. Nginx 将 `/` 转发到 5200、`/api/` 转发到 8081、`/admin/` 指向管理端静态目录。

更详细的说明见 [`docs/architecture.md`](docs/architecture.md)。

## 许可证

本项目采用 MIT 许可证，见 [LICENSE](LICENSE)。

管理端基于 [SoybeanAdmin](https://github.com/soybeanjs/soybean-admin)（MIT）改造，
其原始许可证保留在 `admin/LICENSE`。
