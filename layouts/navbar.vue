<script setup lang="ts">
import {ref, computed, onMounted, reactive, h, watch, createVNode} from 'vue';
  import { useRoute } from 'vue-router';
  import { RouteList } from '~/composables/Route';
  import {useLanguage} from "~/composables/states";
import {
  AppstoreAddOutlined,
  AppstoreOutlined,
  BarChartOutlined, ExclamationCircleOutlined, FileSearchOutlined, SettingOutlined, ShopOutlined,
  ShoppingCartOutlined, SnippetsOutlined, StockOutlined, TeamOutlined, ToolOutlined,
  ToTopOutlined, UserOutlined,
  VerticalAlignBottomOutlined, WalletOutlined
} from "@ant-design/icons-vue";
import {translations} from "~/composables/translations";
import type {LogoutInterface} from "~/composables/Auth/auth.interface";
import {logoutUser, testTokenUser} from "~/composables/Auth/auth.service";

  // State
  const state = reactive({
    collapsed: false,
    selectedKeys: ['1'],
    openKeys: ['inventory'],
    preOpenKeys: ['inventory', 'settings'],
  });

  // Admin and User ID refs
  const isAdmin = ref<string | null>(null);
  const userId = ref<string | null>(null);
  //This is a global state for language of the app
  const language = useLanguage();




  const adminMenuItems = computed(() => [
    {
      key: '1',
      icon: () => h(BarChartOutlined),
      label: translations[language.value].dashboard,
      title: translations[language.value].dashboard,
      onClick: () => navigateTo(RouteList.DASHBOARD),
    },
    {
      key: 'inventory',
      icon: () => h(ShoppingCartOutlined),
      label: translations[language.value].inventory,
      title: translations[language.value].inventory,
      children: [
        {
          key: '2',
          icon: () => h(VerticalAlignBottomOutlined),
          label: translations[language.value].purchase,
          title: translations[language.value].purchase,
          onClick: () => navigateTo(RouteList.INVENTORY_PURCHASE),
        },
        {
          key: '3',
          icon: () => h(ToTopOutlined),
          label: translations[language.value].sales,
          title: translations[language.value].sales,
          onClick: () => navigateTo(RouteList.INVENTORY_SALES),
        },
        {
          key: '4',
          icon: () => h(StockOutlined),
          label: language.value === 'ENG' ? 'Stock situation' : 'Situation stocks',
          title: translations[language.value].stockSituation,
          onClick: () => navigateTo(RouteList.STOCK_SITUATION),
        },
        {
          key: '13',
          icon: () => h(SnippetsOutlined),
          label: language.value === 'ENG' ? 'Invoices' : 'Factures',
          title: language.value === 'ENG' ? 'Invoices' : 'Factures',
          onClick: () => navigateTo(RouteList.INVOICE),
        },
      ],
    },
    {
      key: '12',
      icon: () => h(WalletOutlined),
      label: translations[language.value].expenses,
      title: translations[language.value].expenses,
      onClick: () => navigateTo(RouteList.EXPENSES),
    },
    {
      key: 'settings',
      icon: () => h(SettingOutlined),
      label: translations[language.value].settings,
      title: translations[language.value].settings,
      children: [
        {
          key: '5',
          icon: () => h(ToolOutlined),
          label: translations[language.value].generale,
          title: translations[language.value].generale,
          onClick: () => navigateTo(RouteList.GENERALE),
        },
        {
          key: '6',
          icon: () => h(UserOutlined),
          label: translations[language.value].profile,
          title: translations[language.value].profile,
          onClick: () => navigateTo(RouteList.PROFILE + '/' + userId.value),
        },
        {
          key: '7',
          icon: () => h(TeamOutlined),
          label: translations[language.value].user,
          title: translations[language.value].user,
          onClick: () => navigateTo(RouteList.USER),
        },
        {
          key: '8',
          icon: () => h(AppstoreOutlined),
          label: translations[language.value].category,
          title: translations[language.value].category,
          onClick: () => navigateTo(RouteList.CATEGORY),
        },
        {
          key: '9',
          icon: () => h(AppstoreAddOutlined),
          label: translations[language.value].unit,
          title: translations[language.value].unit,
          onClick: () => navigateTo(RouteList.UNIT),
        },
        {
          key: '10',
          icon: () => h(ShopOutlined),
          label: translations[language.value].product,
          title: translations[language.value].product,
          onClick: () => navigateTo(RouteList.PRODUCT),
        },
        {
          key: '11',
          icon: () => h(FileSearchOutlined),
          label: translations[language.value].expensesType,
          title: translations[language.value].expensesType,
          onClick: () => navigateTo(RouteList.EXPENSE_TYPE),
        },
      ],
    },
  ]);

  const managerMenuItems = computed(() => [
    {
      key: 'settings',
      icon: () => h(SettingOutlined),
      label: translations[language.value].settings,
      title: translations[language.value].settings,
      children: [
        {
          key: '6',
          icon: () => h(UserOutlined),
          label: translations[language.value].profile,
          title: translations[language.value].profile,
          onClick: () => navigateTo(RouteList.PROFILE + '/' + userId.value),
        },
      ],
    },
    {
      key: 'inventory',
      icon: () => h(ShoppingCartOutlined),
      label: translations[language.value].inventory,
      title: translations[language.value].inventory,
      children: [
        {
          key: '2',
          icon: () => h(VerticalAlignBottomOutlined),
          label: translations[language.value].purchase,
          title: translations[language.value].purchase,
          onClick: () => navigateTo(RouteList.INVENTORY_PURCHASE),
        },
        {
          key: '3',
          icon: () => h(ToTopOutlined),
          label: translations[language.value].sales,
          title: translations[language.value].sales,
          onClick: () => navigateTo(RouteList.INVENTORY_SALES),
        },
      ],
    },
  ]);


  // Route and Router
  const route = useRoute();

  // Computed width of the side based on collapsed state
  const sideWidth = computed(() => (state.collapsed ? '80px' : '200px'));

  // Update selected menu keys based on the current route
  const updateSelectedKeys = () => {
    switch (route.path) {
      case RouteList.DASHBOARD:
        state.selectedKeys = ['1'];
        break;
      case RouteList.INVENTORY_PURCHASE:
        state.selectedKeys = ['2'];
        break;
      case RouteList.INVENTORY_PURCHASE_NEW:
        state.selectedKeys = ['2'];
        break;
      case RouteList.INVENTORY_SALES:
        state.selectedKeys = ['3'];
        break;
      case RouteList.INVENTORY_SALES_NEW:
        state.selectedKeys = ['3'];
        break;
      case RouteList.STOCK_SITUATION:
        state.selectedKeys = ['4'];
        break;
      case RouteList.GENERALE:
        state.selectedKeys = ['5'];
        break;
      case RouteList.PROFILE:
        state.selectedKeys = ['6'];
        break;
      case RouteList.USER:
        state.selectedKeys = ['7'];
        break;
      case RouteList.CATEGORY:
        state.selectedKeys = ['8'];
        break;
      case RouteList.UNIT:
        state.selectedKeys = ['9'];
        break;
      case RouteList.PRODUCT:
        state.selectedKeys = ['10'];
        break;
      case RouteList.EXPENSE_TYPE:
        state.selectedKeys = ['11'];
        break;
      case RouteList.EXPENSES:
        state.selectedKeys = ['12'];
        break;
      case RouteList.INVOICE:
        state.selectedKeys = ['13'];
        break;
        case RouteList.WELCOME:
        state.selectedKeys = ['0'];
        break;
      default:
        state.selectedKeys = ['6'];
        break;
    }
  };

  // Toggle sidebar collapsed state
  const toggleCollapsed = () => {
    state.collapsed = !state.collapsed;
    state.openKeys = state.collapsed ? [] : state.preOpenKeys;
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

  // On component mount, update selected keys and retrieve user data
  onMounted(() => {
    testToken();
    isAdmin.value = localStorage.getItem("is_admin");
    userId.value = localStorage.getItem("userId");
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
        v-if="isAdmin !== null"
        v-model:openKeys="state.openKeys"
        v-model:selectedKeys="state.selectedKeys"
        mode="inline"
        theme="dark"
        :inline-collapsed="state.collapsed"
        :items="isAdmin === 'true' ? adminMenuItems : managerMenuItems"
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
            <div class="mr-5">
              <a-select
                  v-model:value="language"
                  style="width: 100%"
              >
                <a-select-option value="ENG" label="USA">
                  <span role="img" aria-label="USA">🇺🇸</span>
                  &nbsp;&nbsp;{{ language === 'ENG' ? 'English' : 'Anglais' }}
                </a-select-option>
                <a-select-option value="FR" label="USA">
                  <span role="img" aria-label="USA">🇫🇷</span>
                  &nbsp;&nbsp;{{ language === 'ENG' ? 'French' : 'Français' }}
                </a-select-option>
              </a-select>
            </div>
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
        Ny Aina Fitiavana FITAHIANTSOA ©2024
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
