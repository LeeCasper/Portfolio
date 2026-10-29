# 贡献指南

这是一个个人作品集项目。如果你是自己部署一份，或想提交改进，可以按下面的流程操作。

## 本地开发

### 环境要求

- **Node.js** 22+（项目使用 pnpm，版本见 `package.json` 的 `packageManager` 字段）
- **JDK** 21+
- **Maven** 3.9+
- **pnpm** 12+

### 启动步骤

```bash
# 1. 安装前端依赖
pnpm install

# 2. 配置前端环境变量
cp .env.example .env

# 3. 启动后端（必须提供后台 Token，否则会拒绝启动）
cd backend
CONTENT_ADMIN_TOKEN=your-token mvn spring-boot:run
# 后端默认监听 8081，并在首次启动时创建 storage/ 目录

# 4. 另开一个终端启动前端
cd ..
pnpm dev
# http://localhost:5200
```

后台入口在 `/admin`，输入与 `CONTENT_ADMIN_TOKEN` 相同的 Token 即可。

## 提交前检查

```bash
pnpm check      # Biome 静态检查（只读，不会修改文件）
pnpm build      # astro check + 构建
cd backend && mvn -DskipTests package
```

`pnpm format` 会调用 Biome 自动修复格式与 import 顺序；它只处理 TS/JS/JSON，
`.astro` 文件不在 Biome 1.x 的支持范围内，不会被改动。

## 代码约定

- 前端使用 TypeScript / Astro，缩进为 tab；后端 Java 使用 4 空格。
- 后端接口约定：
  - `/api/public/**` 只读
  - `/api/admin/**` 需要 `X-ADMIN-TOKEN` 请求头
  - `/api/files/**` 回源媒体文件
- 可变内容（个人信息、项目、文章、作品）走后端，导航、社交链接、经历等静态展示数据放在 `src/collections/`。
- 新增后台页面时复用 `src/layouts/AdminLayout.astro` 与 `src/styles/admin.css`，不要重复写 token 区与表单样式。
- 错误响应统一为 `{"message": "...", "errors": [...]}`。

## 提交信息

建议遵循 [Conventional Commits](https://www.conventionalcommits.org/)：

- `feat:` 新功能
- `fix:` Bug 修复
- `docs:` 文档
- `refactor:` 重构
- `chore:` 构建/工具
