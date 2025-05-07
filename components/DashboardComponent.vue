<script setup lang="ts">
  import {translations} from "~/composables/translations";
  import {computed, onMounted, ref} from "vue";
  import {handleInAuthorizedError} from "~/composables/CustomError";
  import type {
    IAllCashSummary,
    IExpensesCash, IPresentCashSummary, IProfitLoss, IRevenueCash, ISalesPurchase,
  } from "~/composables/cash/cashSummary.interface";
  import {
    getAllCashSummaryService,
    getExpensesCashService, getPresentCashSummaryService,
    getProfitAndLossService, getRevenueCashService, getSalesPurchaseService
  } from "~/composables/cash/cashSummary.service";
  import type {ICurrency} from "~/composables/settings/general/settings.interface";
  import {getCurrencyService} from "~/composables/settings/general/settings.service";
  import type {SelectProps} from "ant-design-vue/lib";

  // This is a global state for language of the app
  const language = useLanguage();

  const loadingPresentCash = ref<boolean>(false);
  const dataPresentCash = reactive<IPresentCashSummary>({
    presentExpensesAmount: 0,
    presentPurchaseAmount: 0,
    presentSalesAmount: 0,
  });
  const optionsMode = ref<SelectProps['options']>([
      { value: 'weekly', label: 'Weekly' },
      { value: 'monthly', label: 'Monthly' },
      { value: 'yearly', label: 'Yearly' },
  ]);
  const currencyType = ref<string>('');
  //Ref for real cash
  const loadingCashSummary = ref<boolean>(false);
  const initialCash = ref<string>('0.00');
  const totalOfSales = ref<string>('0.00');
  const totalOfPurchase = ref<string>('0.00');
  const totalOfExpenses = ref<string>('0.00');
  const realCash = ref<string>('0.00');

  //Ref for Profit and loss
  const loadingProfitLoss = ref<boolean>(false);
  const modeChartProfitLoss = ref<'weekly' | 'monthly' | 'yearly'>('monthly');
  const xAxisProfitLoss = ref<any>([]);
  const profitAmount = ref<number[]>([]);
  const lossAmount = ref<number[]>([]);
  //Ref for Sales and purchase
  const loadingSalesPurchase = ref<boolean>(false);
  const modeChartSalesPurchase = ref<'weekly' | 'monthly' | 'yearly'>('monthly');
  const xAxisSalesPurchase = ref<any>([]);
  const salesAmount = ref<number[]>([]);
  const purchaseAmount = ref<number[]>([]);
  //Ref for Expenses
  const loadingExpenses = ref<boolean>(false);
  const modeChartExpenses = ref<'weekly' | 'monthly' | 'yearly'>('monthly');
  const xAxisExpenses = ref<any>([]);
  const expensesAmount = ref<number[]>([]);
  //Ref for revenue growth
  const loadingRevenue = ref<boolean>(false);
  const modeChartRevenue = ref<'monthly' | 'yearly'>('monthly');
  const xAxisRevenue = ref<any>([]);
  const revenueAmount = ref<number[]>([]);

  const getPresentCashSummary = async () => {
    try {
      loadingPresentCash.value = true;
      const response: IPresentCashSummary = await getPresentCashSummaryService();

      dataPresentCash.presentSalesAmount = response.presentSalesAmount;
      dataPresentCash.presentPurchaseAmount = response.presentPurchaseAmount;
      dataPresentCash.presentExpensesAmount = response.presentExpensesAmount;
      loadingPresentCash.value = false;
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
  }

  const getAllCashSummary = async () => {
    try {
      loadingCashSummary.value = true;
      const response: IAllCashSummary = await getAllCashSummaryService();

      initialCash.value = formatPrice(response.initial_cash);
      totalOfSales.value = formatPrice(response.total_sales_amount);
      totalOfPurchase.value = formatPrice(response.total_purchase_amount);
      totalOfExpenses.value = formatPrice(response.total_expenses_amount);
      realCash.value = formatPrice(response.real_cash);

      loadingCashSummary.value = false;
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
  }

  const getRevenue = async () => {
    try {
      loadingRevenue.value = true;
      // Clear previous data
      xAxisRevenue.value = [];
      revenueAmount.value = [];

      const result: IRevenueCash[]  = await getRevenueCashService(modeChartRevenue.value);

      result.map(item => {
        xAxisRevenue.value.push(modeChartRevenue.value === 'weekly' ? formatDateString(item.x_series, language.value, false) : item.x_series);
        revenueAmount.value.push(item.revenue);
      });

      loadingRevenue.value = false;
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
  }

  const getProfitAndLoss = async () => {
    try {
      loadingProfitLoss.value = true;
      // Clear previous data
      xAxisProfitLoss.value = [];
      profitAmount.value = [];
      lossAmount.value = [];

      const result: IProfitLoss[]  = await getProfitAndLossService(modeChartProfitLoss.value);

      result.map(item => {
        xAxisProfitLoss.value.push(modeChartProfitLoss.value === 'weekly' ? formatDateString(item.x_series, language.value, false) : item.x_series);
        profitAmount.value.push(item.total_profit_amount);
        lossAmount.value.push(item.total_loss_amount);
      });

      loadingProfitLoss.value = false;
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
  }

  const getSalesAndPurchase = async () => {
    try {
      loadingSalesPurchase.value = true;
      // Clear previous data
      xAxisSalesPurchase.value = [];
      salesAmount.value = [];
      purchaseAmount.value = [];

      const result: ISalesPurchase[]  = await getSalesPurchaseService(modeChartSalesPurchase.value);

      result.map(item => {
        xAxisSalesPurchase.value.push(modeChartSalesPurchase.value === 'weekly' ? formatDateString(item.x_series, language.value, false) : item.x_series);
        salesAmount.value.push(item.total_sales_amount);
        purchaseAmount.value.push(item.total_purchase_amount);
      });

      loadingSalesPurchase.value = false;
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
  }

  const getExpenses = async () => {
    try {
      loadingExpenses.value = true;
      // Clear previous data
      xAxisExpenses.value = [];
      expensesAmount.value = [];

      const result: IExpensesCash[]  = await getExpensesCashService(modeChartExpenses.value);

      result.map(item => {
        xAxisExpenses.value.push(modeChartExpenses.value === 'weekly' ? formatDateString(item.x_series, language.value, false) : item.x_series);
        expensesAmount.value.push(item.total_expenses_amount);
      });

      loadingExpenses.value = false;
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
  }

  const getCurrencyType = async () => {
    try {
      const dataCurrencyType: ICurrency = await getCurrencyService();

      currencyType.value = dataCurrencyType.currencyType;

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
  }

  watchEffect(() => {
    if (optionsMode.value) {
      optionsMode.value[0].label = translations[language.value].weekly;
      optionsMode.value[1].label = translations[language.value].monthly;
      optionsMode.value[2].label = translations[language.value].yearly;
    }
  });

  // Watch for mode changes of modeChartRevenue and re-fetch data, then re-render chart
  watch(modeChartRevenue, async () => {
    await getRevenue(); // Fetch new data when mode changes
  });

  // Watch for mode changes of modeChartProfitLoss and re-fetch data, then re-render chart
  watch(modeChartProfitLoss, async () => {
    await getProfitAndLoss(); // Fetch new data when mode changes
  });

  // Watch for mode changes of modeChartSalesPurchase and re-fetch data, then re-render chart
  watch(modeChartSalesPurchase, async () => {
    await getSalesAndPurchase(); // Fetch new data when mode changes
  });

  // Watch for mode changes of modeChartExpenses and re-fetch data, then re-render chart
  watch(modeChartExpenses, async () => {
    await getExpenses(); // Fetch new data when mode changes
  });

  // Watch for mode changes of modeChartRevenue and re-fetch data, then re-render chart
  watch(modeChartRevenue, async () => {
    await getRevenue(); // Fetch new data when mode changes
  });

  const  loadAllData = async () => {
    await getCurrencyType();
    await getPresentCashSummary();
    await getRevenue();
    await getAllCashSummary();
    await getProfitAndLoss();
    await getSalesAndPurchase();
    await getExpenses();
  }

  onMounted( async () => {
    await loadAllData();
  });

  //-------------------Beginning of chart function--------------------------
  //Recipes chart
  const chartColumnRecipeOptions = computed(() => ({
    chart: {
      type: 'area', // Change to 'column' for vertical bars
      animation: {
        enabled: false
      }
    },
    title: {
      text: translations[language.value].recipes,
    },
    xAxis: {
      categories: xAxisRevenue.value,
      labels: {
        rotation: -45, // Optional: Rotate labels if needed
        style: {
          fontSize: '12px',
          fontFamily: 'Arial'
        }
      },
      tickWidth: 0
    },
    yAxis: {
      title: {
        text: translations[language.value].amount + " (" + (language.value === 'ENG' ? 'in ' : 'en ') + currencyType.value + ")",
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineWidth: 1,
        marker: {
          enabled: false
        },
        dataLabels: {
          enabled: false,
        }
      }
    },
    series: [
      {
        name: translations[language.value].recipes,
        color: '#3490dc',
        data: revenueAmount.value
      },
    ]
  }));
  //Profit and loss chart
  const chartColumnProfitLossOptions = computed(() => ({
    chart: {
      type: 'column', // Change to 'column' for vertical bars
      animation: {
        enabled: false
      }
    },
    title: {
      text: translations[language.value].profitsLosses,
    },
    xAxis: {
      categories: xAxisProfitLoss.value,
      labels: {
        rotation: -45, // Optional: Rotate labels if needed
        style: {
          fontSize: '12px',
          fontFamily: 'Arial'
        }
      },
    },
    yAxis: {
      min: 0,
      title: {
        text: translations[language.value].amount + " (" + (language.value === 'ENG' ? 'in ' : 'en ') + currencyType.value + ")",
        align: 'high'
      },
      labels: {
        overflow: 'justify',
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: false,
        }
      }
    },
    series: [
      {
        name: translations[language.value].profits,
        data: profitAmount.value
      },
      {
        color: '#ff5959',
        name: translations[language.value].losses,
        data: lossAmount.value
      },
    ]
  }));
  //Sales and purchase chart
  const chartColumnSalesPurchaseOptions = computed(() => ({
    chart: {
      type: 'column', // Change to 'column' for vertical bars
      animation: {
        enabled: false
      }
    },
    title: {
      text: translations[language.value].salesPurchases,
    },
    xAxis: {
      categories: xAxisSalesPurchase.value,
      labels: {
        rotation: -45, // Optional: Rotate labels if needed
        style: {
          fontSize: '12px',
          fontFamily: 'Arial'
        },
      },
      tickWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: translations[language.value].amount + " (" + (language.value === 'ENG' ? 'in ' : 'en ') + currencyType.value + ")",
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    plotOptions: {
      column: {
        dataLabels: {
          enabled: false,
        }
      }
    },
    series: [
      {
        name: translations[language.value].sales,
        color: '#38c172',
        data: salesAmount.value
      },
      {
        name: translations[language.value].purchase,
        color: '#3490dc',
        data: purchaseAmount.value
      }
    ]
  }));
  //Expenses chart
  const chartColumnExpensesOptions = computed(() => ({
    chart: {
      type: 'area', // Change to 'column' for vertical bars
      animation: {
        enabled: false
      }
    },
    title: {
      text: translations[language.value].expenses,
    },
    xAxis: {
      categories: xAxisExpenses.value,
      labels: {
        rotation: -45, // Optional: Rotate labels if needed
        style: {
          fontSize: '12px',
          fontFamily: 'Arial'
        }
      },
      tickWidth: 0
    },
    yAxis: {
      min: 0,
      title: {
        text: translations[language.value].amount + " (" + (language.value === 'ENG' ? 'in ' : 'en ') + currencyType.value + ")",
        align: 'high'
      },
      labels: {
        overflow: 'justify'
      }
    },
    plotOptions: {
      area: {
        stacking: 'normal',
        lineWidth: 1,
        marker: {
          enabled: false
        },
        dataLabels: {
          enabled: false,
        }
      }
    },
    series: [
      {
        name: translations[language.value].expenses,
        color: '#e5b33e',
        data: expensesAmount.value
      },
    ]
  }));
  //-------------------End of chart function--------------------------
</script>

<template>
  <Title>{{ translations[language].dashboard }}</Title>
  <ATypographyTitle class="flex" style="font-size: 20px;">
    <user-outlined />&nbsp;
    <span>{{ translations[language].dashboard }}</span>&nbsp;&nbsp;
    <a-tooltip :title="translations[language].refresh" :color="'blue'">
      <SyncOutlined class="primary-color" @click="loadAllData"/>
    </a-tooltip>
  </ATypographyTitle>
  <!--Beginning of spaces-->
  <a-row class="mt-5" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col class="gutter-row" :span="8">
      <div class="gutter-box">
        <ACard class="card-space">
          <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
            <ASpace direction="horizontal">
                <ShoppingOutlined class="success-color icon-space" />
                <AStatistic class="w-full" :title="translations[language].sales" :value="dataPresentCash.presentSalesAmount"/>
                <span>{{ currencyType }}</span>
            </ASpace>
          </a-skeleton>
        </ACard>
      </div>
    </a-col>
    <a-col class="gutter-row" :span="8">
      <div class="gutter-box">
        <ACard class="card-space">
          <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
            <ASpace direction="horizontal">
              <ShoppingCartOutlined class="info-color icon-space" />
              <AStatistic :title="translations[language].purchase" :value="dataPresentCash.presentPurchaseAmount"/>
              <span>{{ currencyType }}</span>
            </ASpace>
          </a-skeleton>
        </ACard>
      </div>
    </a-col>
    <a-col class="gutter-row" :span="8">
      <div class="gutter-box">
        <ACard class="card-space">
          <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
            <ASpace direction="horizontal">
              <ASpace direction="horizontal">
                <WalletOutlined class="warning-color icon-space" />
                <AStatistic :title="translations[language].expenses" :value="dataPresentCash.presentExpensesAmount"/>
                <span>{{ currencyType }}</span>
              </ASpace>
            </ASpace>
          </a-skeleton>
        </ACard>
      </div>
    </a-col>
  </a-row>
  <!--Recipes chart & cash summary-->
  <a-row class="mt-8" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <!--Recipes chart-->
    <a-col class="gutter-row" :span="16">
      <div class="gutter-box">
        <ACard class="card-space" style="min-height: 500px;">
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-select
                  v-model:value="modeChartRevenue"
                  :options="optionsMode"
                  placeholder=""
                  style="width: 200px"
              />
            </a-col>
          </a-row>
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-spin :spinning="loadingRevenue" size="default">
                <highchart v-if="!loadingRevenue" :options="chartColumnRecipeOptions"/>
              </a-spin>
            </a-col>
          </a-row>
        </ACard>
      </div>
    </a-col>
    <!--Cash summary-->
    <a-col :span="8">
      <div class="gutter-box" >
        <ACard class="card-space" style="min-height: 500px;">
          <a-row class="flex justify-center" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <ATypographyTitle class="mt-9" style="font-size: 18px;">
              <span>{{ translations[language].cashSummary }}</span>
            </ATypographyTitle>
          </a-row>
          <a-row class="mt-5" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
              <ATypographyTitle class="flex ml-5" style="font-size: 14px;">
                <MoneyCollectOutlined class="primary-color" style="font-size: 25px;"/>&nbsp;
                <span>{{ translations[language].initialCash }} : </span>&ensp;
                <span style="font-weight: 400;">{{ initialCash }} {{ currencyType }}</span>
              </ATypographyTitle>
            </a-skeleton>
          </a-row>
          <a-row class="mt-5" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
              <ATypographyTitle class="flex ml-5" style="font-size: 14px;">
                <ShoppingOutlined class="success-color" style="font-size: 25px;"/>&nbsp;
                <span>{{ translations[language].totalOfSales }} : </span>&ensp;
                <span style="font-weight: 400;">{{ totalOfSales }} {{ currencyType }}</span>
              </ATypographyTitle>
            </a-skeleton>
          </a-row>
          <a-row class="mt-5" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
              <ATypographyTitle class="flex ml-5" style="font-size: 14px;">
                <ShoppingCartOutlined class="info-color" style="font-size: 25px;"/>&nbsp;
                <span>{{ translations[language].totalOfPurchase }} : </span>&ensp;
                <span style="font-weight: 400;">{{ totalOfPurchase }} {{ currencyType }}</span>
              </ATypographyTitle>
            </a-skeleton>
          </a-row>
          <a-row class="mt-5" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
              <ATypographyTitle class="flex ml-5" style="font-size: 14px;">
                <WalletOutlined class="warning-color" style="font-size: 25px;"/>&nbsp;
                <span>{{ translations[language].totalOfExpenses }} : </span>&ensp;
                <span style="font-weight: 400;">{{ totalOfExpenses }} {{ currencyType }}</span>
              </ATypographyTitle>
            </a-skeleton>
          </a-row>
          <a-row class="mt-5" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-skeleton avatar :paragraph="{ rows: 1 }" :loading="loadingCashSummary" active="true">
              <ATypographyTitle class="flex ml-5" style="font-size: 14px;">
                <PropertySafetyOutlined class="primary-color" style="font-size: 25px;"/>&nbsp;
                <span>{{ translations[language].realCash }} : </span>&ensp;
                <span style="font-weight: 400;">{{ realCash }} {{ currencyType }}</span>
              </ATypographyTitle>
            </a-skeleton>
          </a-row>
        </ACard>
      </div>
    </a-col>
  </a-row>
  <!--Sales and Purchase / profit and loss chart-->
  <a-row class="mt-8" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <!--Sales and Purchase chart-->
    <a-col :span="12">
      <div class="gutter-box">
        <ACard class="card-space" style="min-height: 500px;">
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-select
                  v-model:value="modeChartSalesPurchase"
                  :options="optionsMode"
                  placeholder=""
                  style="width: 200px"
              />
            </a-col>
          </a-row>
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-spin :spinning="loadingSalesPurchase" size="default">
                <highchart v-if="!loadingSalesPurchase" :options="chartColumnSalesPurchaseOptions"/>
              </a-spin>
            </a-col>
          </a-row>
        </ACard>
      </div>
    </a-col>
    <!--Profit and loss chart-->
    <a-col class="gutter-row" :span="12">
      <div class="gutter-box">
        <ACard class="card-space" style="min-height: 500px;">
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-select
                  v-model:value="modeChartProfitLoss"
                  :options="optionsMode"
                  placeholder=""
                  style="width: 200px"
              />
            </a-col>
          </a-row>
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-spin :spinning="loadingProfitLoss" size="default">
                <highchart v-if="!loadingProfitLoss" :options="chartColumnProfitLossOptions"/>
              </a-spin>
            </a-col>
          </a-row>
        </ACard>
      </div>
    </a-col>
  </a-row>
  <!--Expenses chart-->
  <a-row class="mt-8" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col :span="24">
      <div class="gutter-box">
        <ACard class="card-space" style="min-height: 500px;">
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-select
                  v-model:value="modeChartExpenses"
                  :options="optionsMode"
                  placeholder=""
                  style="width: 200px"
              />
            </a-col>
          </a-row>
          <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
            <a-col class="gutter-row" :span="24">
              <a-spin :spinning="loadingExpenses" size="default">
                <highchart v-if="!loadingExpenses" :options="chartColumnExpensesOptions"/>
              </a-spin>
            </a-col>
          </a-row>
        </ACard>
      </div>
    </a-col>
  </a-row>
</template>

<style scoped>
.icon-space {
  font-size: 30px;
}
.card-space {
  box-shadow: rgba(0, 0, 0, 0.24) 0 5px 20px;
}
</style>
