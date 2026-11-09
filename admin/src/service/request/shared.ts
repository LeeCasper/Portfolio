import { localStg } from '@/utils/storage';
import type { RequestInstanceState } from './type';

/** 读取后台 Token（原样返回，不使用 Bearer 前缀） */
export function getAdminToken() {
  return localStg.get('token') || '';
}

export function showErrorMsg(state: RequestInstanceState, message: string) {
  if (!state.errMsgStack?.length) {
    state.errMsgStack = [];
  }

  const isExist = state.errMsgStack.includes(message);

  if (!isExist) {
    state.errMsgStack.push(message);

    window.$message?.error(message, {
      onLeave: () => {
        state.errMsgStack = state.errMsgStack.filter(msg => msg !== message);

        setTimeout(() => {
          state.errMsgStack = [];
        }, 5000);
      }
    });
  }
}
