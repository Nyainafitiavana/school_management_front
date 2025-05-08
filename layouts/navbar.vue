<script setup lang="ts">
import {ref, computed, onMounted, reactive, h, watch, createVNode} from 'vue';
  import { useRoute } from 'vue-router';
  import { RouteList } from '~/composables/Route';
  import {useLanguage} from "~/composables/states";
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  BarChartOutlined,
  BookOutlined,
  CalendarOutlined,
  ExclamationCircleOutlined,
  FileSearchOutlined, KeyOutlined,
  SettingOutlined,
  ShopOutlined,
  ShoppingCartOutlined,
  SnippetsOutlined,
  StockOutlined,
  TeamOutlined,
  ToolOutlined,
  ToTopOutlined,
  UserOutlined,
  VerticalAlignBottomOutlined,
  WalletOutlined
} from "@ant-design/icons-vue";
import {translations} from "~/composables/translations";
import type {LogoutInterface} from "~/composables/Auth/auth.interface";
import {logoutUser, testTokenUser} from "~/composables/Auth/auth.service";
import {getUserMenuService} from "~/composables/menu/menu.service";
import type {NoPaginateData} from "~/composables/apiResponse.interface";
import type {IUserMenu, Menu} from "~/composables/menu/menu.interface";
import {insertOrUpdateUser} from "~/composables/User/user.service";
import {handleInAuthorizedError} from "~/composables/CustomError";

  // State
  const state = reactive({
    collapsed: false,
    selectedKeys: ['0'],
    openKeys: ['0'],
    preOpenKeys: ['0'],
  });

  const userId = ref<string | null>(null);
  //This is a global state for language of the app
  const language = useLanguage();
  const dynamicMenus = ref<Menu[]>([]);



const iconMap: Record<string, any> = {
  User: UserOutlined,
  Dashboard: BarChartOutlined,
  Student: TeamOutlined,
  Subject: BookOutlined,
  SchoolYear: CalendarOutlined,
  Level: StockOutlined,
  Privilege: KeyOutlined,
};


const MenuItems = computed(() => {
  return dynamicMenus.value.map((menu, index) => {
    const IconComponent = iconMap[menu.code] || BarChartOutlined; // fallback
    return {
      key: menu.code,
      icon: () => h(IconComponent),
      label: menu.designation,
      title: menu.designation,
      onClick: () => navigateTo(menu.path || '#'),
    };
  });
});


  // Route and Router
  const route = useRoute();

  // Computed width of the side based on collapsed state
  const sideWidth = computed(() => (state.collapsed ? '80px' : '200px'));

  // Update selected menu keys based on the current route
  const updateSelectedKeys = () => {
    switch (route.path) {
      case RouteList.WELCOME:
        state.selectedKeys = ['0'];
        break;
      case RouteList.DASHBOARD:
        state.selectedKeys = ['Dashboard'];
        break;
      case RouteList.USER:
      state.selectedKeys = ['User'];
      break;
      case RouteList.STUDENT:
      state.selectedKeys = ['Student'];
      break;
      case RouteList.SUBJECT:
      state.selectedKeys = ['Subject'];
      break;
      case RouteList.SCHOOL_YEAR:
      state.selectedKeys = ['SchoolYear'];
      break;
      case RouteList.LEVEL:
      state.selectedKeys = ['Level'];
      break;
      case RouteList.PRIVILEGE:
      state.selectedKeys = ['Privilege'];
      break;
      default:
        state.selectedKeys = ['0'];
        break;
    }
  };

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    state.collapsed = !state.collapsed;
  };

  const logout = async () => {
    try {
      const data: LogoutInterface = await logoutUser();

      await localStorage.setItem('access_token', '');
      await localStorage.setItem('userId', '');

      notification.success({
        message: translations[language.value].success,
        description: data.message,
        class: 'custom-success-notification'
      });

      await navigateTo(RouteList.LOGIN);

    } catch (error) {
      notification.error({
        message: 'Login Failed',
        description: error.message,
        class: 'custom-error-notification'
      });
    }
  };

  const testToken = async () => {
    try {
      //Stay here if token validate
      const data: LogoutInterface = await testTokenUser();
    } catch (error) {
      notification.error({
        message: 'Login Failed',
        description: error.message,
        class: 'custom-error-notification'
      });

      await localStorage.setItem('access_token', '');
      await localStorage.setItem('userId', '');
      //Return to login if token invalidate
      await navigateTo(RouteList.LOGIN);
    }
  };

  // Toggle sidebar collapsed state
  const handleLogout = () => {
    Modal.confirm({
      title: translations[language.value].confirmLogout,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmLogoutMessage,
      okText: translations[language.value].yesLogout,
      cancelText: translations[language.value].cancel,
      onOk: async () => {
        await logout();
      }
    });
  };

  const getAllUserMenu = async () => {
    try {
      const userMenu: NoPaginateData<IUserMenu[]> = await getUserMenuService(userId.value);
      // Initialisation d'une Map pour éviter les doublons
      const menuMap = new Map<string, Menu>();

      userMenu.data.forEach((user: IUserMenu) => {
        user.rules.MenuRules.forEach(menuRule => {
          const { menu } = menuRule;
          if (!menuMap.has(menu.uuid)) {
            menuMap.set(menu.uuid, menu);
          }
        });
      });

      // Résultat final : liste unique des menus
      dynamicMenus.value = Array.from(menuMap.values());
    } catch (error) {
      //Verification code status if equal 401 then we redirect to log in
      if (error instanceof CustomError) {
        if (error.status === 401) {
          //call the global handle action if in authorized
          handleInAuthorizedError(error);
          return;
        }
      }

      // Show error notification
      notification.error({
        message: translations[language.value].error,
        description: (error as Error).message,
        class: 'custom-error-notification'
      });
    }
  };
  // On component mount, update selected keys and retrieve user data
  onMounted(() => {
    testToken();
    userId.value = localStorage.getItem("userId");
    if (userId.value) {
      getAllUserMenu();
    }
    updateSelectedKeys();
  });

  // Watch for changes in open keys and update previous open keys
  watch(
      () => state.openKeys,
      (_val, oldVal) => {
        state.preOpenKeys = oldVal;
      },
  );
</script>

<template>
  <a-layout>
    <!-- Force re-render on collapse :key="state.collapsed ? 'collapsed' : 'expanded'"-->
    <a-layout-sider
      :key="state.collapsed ? 'collapsed' : 'expanded'"
      v-model:collapsed="state.collapsed"
      :trigger="null"
      collapsible
      class="side"
      :style="{ width: sideWidth, transition: 'width 0.2s' }"
    >

    <div :class="!state.collapsed ? 'logo flex justify-center mt-2' : 'flex justify-center mt-2'">
      <img src="/logo_266x131_removebg.png" alt=""/>
    </div>
    <a-menu
        v-if="userId !== null"
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="state.collapsed"
        :items="MenuItems"
    />
    </a-layout-sider>
    <a-layout :style="{ marginLeft: sideWidth }">
      <a-layout-header style="background: #fff; padding: 0 15px;">
        <a-row>
          <a-col span="12">
            <menu-unfold-outlined
                v-if="state.collapsed"
                class="trigger"
                style="font-size: 20px;"
                @click="toggleCollapsed"
            />
            <menu-fold-outlined
                v-else
                class="trigger"
                style="font-size: 20px;"
                @click="toggleCollapsed"
            />
          </a-col>
          <a-col span="12" class="flex justify-end">
            <div>
              <a-button class="btn--primary" size="middle" @click="handleLogout">
                <template #icon>
                  <LogoutOutlined />
                </template>
              </a-button>
            </div>
          </a-col>
        </a-row>

      </a-layout-header>
      <a-layout-content
          :style="{ margin: '24px 16px 0', overflow: 'initial', padding: '24px', background: '#fff', minHeight: '800px' }"
      >
        <Suspense>
          <template #default>
            <slot/>
          </template>
        </Suspense>
      </a-layout-content>
      <a-layout-footer style="text-align: center">
        Ny Aina Fitiavana FITAHIANTSOA ©2025
      </a-layout-footer>
    </a-layout>
  </a-layout>
</template>

<style scoped>
.side {
  position: fixed;
  top: 0;
  left: 0;
  height: 100vh; /* Full viewport height */
  background: #001529; /* Background color of the side */
  z-index: 1; /* Ensure the side is above other content */
  transition: width 0.2s; /* Smooth transition for width changes */
}

.logo {
  height: 80px;
  margin: 16px;
}
</style>
