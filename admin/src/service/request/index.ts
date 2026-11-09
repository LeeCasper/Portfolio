import type { AxiosResponse } from 'axios';
import { BACKEND_ERROR_CODE, createFlatRequest } from '@sa/axios';
import { getServiceBaseURL } from '@/utils/service';
import { useAuthStore } from '@/store/modules/auth';
import { getAdminToken, showErrorMsg } from './shared';
import type { RequestInstanceState } from './type';

const isHttpProxy = import.meta.env.DEV && import.meta.env.VITE_HTTP_PROXY === 'Y';
const { baseURL } = getServiceBaseURL(import.meta.env, isHttpProxy);

/**
 * 本项目后端是 Spring Boot，直接返回业务数据（没有 { code, data, msg } 包络），
 * 认证使用单 Token 的 `X-ADMIN-TOKEN` 请求头，也没有 refresh token 机制。
 */
export const request = createFlatRequest(
  {
    baseURL
  },
  {
    defaultState: {
      errMsgStack: []
    } as RequestInstanceState,
    transform(response: AxiosResponse) {
      return response.data;
    },
    async onRequest(config) {
      const token = getAdminToken();

      if (token) {
        Object.assign(config.headers, { 'X-ADMIN-TOKEN': token });
      }

      // FormData 请求让浏览器生成 multipart boundary，不能沿用默认的 application/json
      if (config.data instanceof FormData) {
        delete config.headers['Content-Type'];
      }

      return config;
    },
    isBackendSuccess() {
      // axios 已按 HTTP 2xx 判定成功，业务层无需再判断 code
      return true;
    },
    onError(error) {
      const status = error.response?.status;

      // Token 无效或缺失：清除登录态并回到登录页
      if (status === 401) {
        useAuthStore().resetStore();
        return;
      }

      let message = error.message;

      if (error.code === BACKEND_ERROR_CODE) {
        const body = error.response?.data as { message?: string } | undefined;
        message = body?.message || message;
      }

      showErrorMsg(request.state, message);
    }
  }
);
