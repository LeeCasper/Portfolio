import { request } from '../request';

/**
 * 校验后台 Token 是否有效。
 *
 * 本项目没有登录/刷新令牌接口：Token 就是用户在后端 `CONTENT_ADMIN_TOKEN` 中配置的值。
 * 用一个受保护的列表接口做校验——2xx 表示有效，401 由请求层统一处理。
 */
export function fetchVerifyToken() {
  return request<unknown>({ url: '/api/admin/projects' });
}
