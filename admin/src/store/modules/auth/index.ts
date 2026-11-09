import { computed, reactive, ref } from 'vue';
import { useRoute } from 'vue-router';
import { defineStore } from 'pinia';
import { useLoading } from '@sa/hooks';
import { localStg } from '@/utils/storage';
import { fetchVerifyToken } from '@/service/api';
import { $t } from '@/locales';
import { useRouterPush } from '@/hooks/common/router';
import { SetupStoreId } from '@/enum';
import { useRouteStore } from '../route';
import { useTabStore } from '../tab';
import { clearAuthStorage, getToken } from './shared';

/**
 * 单 Token 模式下的固定管理员身份。
 * R_SUPER 对应 VITE_STATIC_SUPER_ROLE，静态路由模式下会放行全部菜单。
 */
const STATIC_ADMIN_USER: Api.Auth.UserInfo = {
  userId: 'admin',
  userName: '管理员',
  roles: ['R_SUPER'],
  buttons: []
};

export const useAuthStore = defineStore(SetupStoreId.Auth, () => {
  const route = useRoute();
  const authStore = useAuthStore();
  const routeStore = useRouteStore();
  const tabStore = useTabStore();
  const { toLogin, redirectFromLogin } = useRouterPush(false);
  const { loading: loginLoading, startLoading, endLoading } = useLoading();

  const token = ref('');

  const userInfo: Api.Auth.UserInfo = reactive({
    userId: '',
    userName: '',
    roles: [],
    buttons: []
  });

  /** is super role in static route */
  const isStaticSuper = computed(() => {
    const { VITE_AUTH_ROUTE_MODE, VITE_STATIC_SUPER_ROLE } = import.meta.env;

    return VITE_AUTH_ROUTE_MODE === 'static' && userInfo.roles.includes(VITE_STATIC_SUPER_ROLE);
  });

  /** Is login */
  const isLogin = computed(() => Boolean(token.value));

  /** Reset auth store */
  async function resetStore() {
    recordUserId();

    clearAuthStorage();

    authStore.$reset();

    if (!route.meta.constant) {
      await toLogin();
    }

    tabStore.cacheTabs();
    routeStore.resetStore();
  }

  /** Record the user ID of the previous login session Used to compare with the current user ID on next login */
  function recordUserId() {
    if (!userInfo.userId) {
      return;
    }

    localStg.set('lastLoginUserId', userInfo.userId);
  }

  /**
   * Check if current login user is different from previous login user If different, clear all tabs
   *
   * @returns {boolean} Whether to clear all tabs
   */
  function checkTabClear(): boolean {
    if (!userInfo.userId) {
      return false;
    }

    const lastLoginUserId = localStg.get('lastLoginUserId');

    // Clear all tabs if current user is different from previous user
    if (!lastLoginUserId || lastLoginUserId !== userInfo.userId) {
      localStg.remove('globalTabs');
      tabStore.clearTabs();

      localStg.remove('lastLoginUserId');
      return true;
    }

    localStg.remove('lastLoginUserId');
    return false;
  }

  /**
   * Login with the admin token
   *
   * @param tokenInput The token configured on the backend (`CONTENT_ADMIN_TOKEN`)
   * @param [redirect=true] Whether to redirect after login. Default is `true`
   */
  async function login(tokenInput: string, redirect = true) {
    startLoading();

    localStg.set('token', tokenInput);

    const pass = await getUserInfo();

    if (pass) {
      token.value = tokenInput;

      // Check if the tab needs to be cleared
      const isClear = checkTabClear();
      let needRedirect = redirect;

      if (isClear) {
        // If the tab needs to be cleared, it means we don't need to redirect.
        needRedirect = false;
      }

      await redirectFromLogin(needRedirect);

      window.$notification?.success({
        title: $t('page.login.common.loginSuccess'),
        content: $t('page.login.common.welcomeBack', { userName: userInfo.userName }),
        duration: 4500
      });
    } else {
      resetStore();
    }

    endLoading();
  }

  /**
   * Verify the stored token and populate the static admin identity.
   * There is no `/auth/getUserInfo` endpoint in this project.
   */
  async function getUserInfo() {
    const { error } = await fetchVerifyToken();

    if (error) {
      return false;
    }

    Object.assign(userInfo, STATIC_ADMIN_USER);

    return true;
  }

  async function initUserInfo() {
    const maybeToken = getToken();

    if (maybeToken) {
      token.value = maybeToken;
      const pass = await getUserInfo();

      if (!pass) {
        resetStore();
      }
    }
  }

  return {
    token,
    userInfo,
    isStaticSuper,
    isLogin,
    loginLoading,
    resetStore,
    login,
    initUserInfo
  };
});
