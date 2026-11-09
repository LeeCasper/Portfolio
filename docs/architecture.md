# 系统整体设计

## 总体思路

- 系统由三部分组成：**Astro 公开站点**（展示层）、**SoybeanAdmin 管理端**（独立 Vue3 SPA）、
  **Spring Boot 内容后端**（REST API）。
- 可变内容通过 REST API 与 Spring Boot 通信；后端负责**文本信息落库**与**媒体文件磁盘存储**，
  不依赖任何云 OSS。
- 通过 `.env`（公开站点）、`admin/.env.*`（管理端）与 `application.yml`（后端）暴露配置。

## 后端（Spring Boot 3）

- 依赖：`spring-boot-starter-web`、`spring-data-jpa`、`spring-boot-starter-validation`；
  数据库为 SQLite 文件（`storage/data/portfolio.db`），兼顾轻量与可移植性。
- 核心实体
  - `Project`：标题、描述、链接、封面/视频路径、标签、排序位、是否精选、是否发布。
  - `BlogPost`：slug、摘要、Markdown 正文、封面、发布时间、是否精选、是否发布。
  - `Profile`：个人简介、联系方式、按钮文案、Hero/简历等资源路径（单例，upsert）。
  - `Work`：作品名称、链接、描述、图片/视频、标签、排序位、是否显示。
  - `MediaAsset`：上传文件的原始名、相对路径、MIME、大小、分类。
- 服务层
  - `FileStorageService`：按 `content.storage-root` 写入磁盘，文件名使用 UUID；
    上传时校验 `category` 与扩展名白名单，回源时确保解析结果不会越出存储根目录。
  - `ProjectService` / `BlogPostService` / `WorkService` / `ProfileService`：CRUD 与 DTO 映射。
    文章列表接口不渲染 Markdown，仅详情接口生成 `contentHtml` 与 `headings`。
- 控制器
  - `/api/public/**`：前端展示用的只读接口。文章详情只返回已发布且发布时间已到的文章。
  - `/api/admin/**`：后台 CRUD，请求头 `X-ADMIN-TOKEN` 必须与 `CONTENT_ADMIN_TOKEN` 一致。
  - `/api/files/**`：回源磁盘文件；仅图片/视频/PDF/文本以 inline 返回，其余强制下载。
- 配置
  - `ContentStorageProperties`（`@ConfigurationProperties(prefix = "content")`）暴露存储路径、
    媒体 URL、CORS 白名单与后台 Token。
  - **`CONTENT_ADMIN_TOKEN` 没有默认值**：未配置时应用在启动阶段直接失败，避免弱口令进入生产。
- 数据初始化
  - 没有 seed 脚本；表结构由 `spring.jpa.hibernate.ddl-auto=update` 维护。
  - `PortfolioApplication.main()` 会在 DataSource 初始化前创建 `storage/data` 目录
    （SQLite 不会自动创建父目录），因此全新克隆可直接启动。

## 前端（Astro）

- `astro.config.mjs`：`output: "server"` + `@astrojs/node`（standalone），开发端口 5200。
- `src/lib/runtime-config.ts` 统一读取 `PUBLIC_API_BASE_URL` / `PUBLIC_MEDIA_BASE_URL`，
  `src/lib/apiClient.ts` 封装公开接口的 `fetch`、错误处理与空响应体处理。
- 页面在 Astro 服务端（frontmatter）中调用 `apiClient` 获取数据，渲染时无需客户端再请求；
  后端不可用或内容为空时页面会回退到本地占位文案。
- 旧的 `/admin` 与 `/admin/*` 只保留一个 SSR 跳转页（`src/pages/admin/[...path].astro`），
  读取 `PUBLIC_ADMIN_URL` 后 302 到管理端，并保留子路径与查询参数。
- 社交链接、导航、经历等低频变更数据放在 `src/collections/`；
  文章正文与项目/作品由后端管理。RSS 与 `/blog` 使用同一个后端数据源。

## 管理端（SoybeanAdmin）

- 位于 `admin/`，是独立的 pnpm workspace（Vue 3 + Vite Plus + Naive UI），开发端口 9530。
- 路由：`VITE_AUTH_ROUTE_MODE=static`，菜单由 `src/views/**/index.vue` 经
  `@elegant-router/vue` 自动生成，无需后端提供菜单接口。
- 认证：单 Token。登录页只接收 `CONTENT_ADMIN_TOKEN`，通过 `GET /api/admin/projects` 校验；
  之后所有请求由请求层附加 `X-ADMIN-TOKEN`。没有账号、角色或 refresh token。
- 请求层：`src/service/request/index.ts` 直接消费后端原生 JSON（没有 `{code,data,msg}` 包络），
  401 时清除登录态；FormData 上传不设置 `Content-Type`，交由浏览器生成 boundary。
- 业务接口封装在 `src/service/api/portfolio.ts`；页面位于
  `src/views/{dashboard,projects,posts,works,profile}/`。
- 开发环境经 Vite 代理 `/proxy-default` 访问后端（`admin/.env.test`）；
  生产环境由 `admin/.env.prod` 的 `VITE_SERVICE_BASE_URL` 指向后端地址，
  需要后端 CORS 允许管理端来源（`PUBLIC_ADMIN_ORIGIN`）。

## 存储策略

- **数据库**：SQLite 文件位于 `storage/data`，可通过 `CONTENT_DATA_PATH` 覆盖。
- **媒体文件**：磁盘路径 `storage/media/{category}`；返回给前端的 URL 形如
  `${CONTENT_MEDIA_BASE_URL}/{relativePath}`。
- **备份**：备份整个 `storage/` 目录即可（数据库与媒体文件在同一目录树下）。

## 部署建议

1. 后端：`mvn -f backend/pom.xml package` 后运行 Jar，监听 8081；
   通过环境变量提供 `CONTENT_ADMIN_TOKEN`，以及需要时的 `CONTENT_DATA_PATH` /
   `CONTENT_STORAGE_ROOT` / `CONTENT_MEDIA_BASE_URL` / `PUBLIC_APP_ORIGIN` / `PUBLIC_ADMIN_ORIGIN`。
2. 公开站点：`pnpm build`，用 `node dist/server/entry.mjs` 运行（`@astrojs/node` standalone），
   并配置 `PUBLIC_SITE_URL`、`PUBLIC_API_BASE_URL` 与 `PUBLIC_ADMIN_URL`。
3. 管理端：`cd admin && pnpm build`，将 `admin/dist` 作为静态站点部署；
   history 模式需要 Web 服务器回退到 `index.html`；构建前设置 `admin/.env.prod`
   的 `VITE_SERVICE_BASE_URL` 指向生产后端。
4. 生产环境 Nginx 建议：`/` 转发至 Astro，`/api` 与 `/api/files` 转发至 Spring Boot；
   管理端可部署在独立域名或子路径，并确保后端 CORS 允许该来源。
5. 迁移服务器时只需同步 `storage/` 与三端的环境变量。
