import type { RouteMeta } from 'vue-router';
import type { RouteKey } from '@elegant-router/types';
import ElegantVueRouter from '@elegant-router/vue/vite';

export function setupElegantRouter() {
  return ElegantVueRouter({
    layouts: {
      base: 'src/layouts/base-layout/index.vue',
      blank: 'src/layouts/blank-layout/index.vue'
    },
    routePathTransformer(routeName, routePath) {
      const key = routeName as RouteKey;

      if (key === 'login') {
        const modules: UnionKey.LoginModule[] = ['pwd-login'];

        const moduleReg = modules.join('|');

        return `/login/:module(${moduleReg})?`;
      }

      return routePath;
    },
    onRouteMetaGen(routeName) {
      const key = routeName as RouteKey;

      const constantRoutes: RouteKey[] = ['login', '403', '404', '500'];

      /** 业务菜单的图标与顺序 */
      const businessRoutes: Record<string, { icon: string; order: number }> = {
        dashboard: { icon: 'mdi:view-dashboard-outline', order: 1 },
        posts: { icon: 'mdi:post-outline', order: 2 },
        works: { icon: 'mdi:briefcase-outline', order: 3 },
        profile: { icon: 'mdi:account-outline', order: 4 }
      };

      const meta: Partial<RouteMeta> = {
        title: key,
        i18nKey: `route.${key}` as App.I18n.I18nKey
      };

      if (constantRoutes.includes(key)) {
        meta.constant = true;
      }

      const businessMeta = businessRoutes[key];

      if (businessMeta) {
        meta.icon = businessMeta.icon;
        meta.order = businessMeta.order;
      }

      return meta;
    }
  });
}
