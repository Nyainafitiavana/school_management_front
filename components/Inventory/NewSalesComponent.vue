<script setup lang="ts">
  import type {SelectValue} from "ant-design-vue/es/select";
  import type {Paginate} from "~/composables/apiResponse.interface";
  import type {IProductRemainingStock} from "~/composables/settings/Product/Product.interface";
  import {
    getAllProductWithRemainingStockService
  } from "~/composables/settings/Product/product.service";
  import {handleInAuthorizedError} from "~/composables/CustomError";
  import type {IDetails, IFormDetails} from "~/composables/Inventory/Movement.interface";
  import {createVNode, h} from "vue";
  import {
    AButton,
    AInputNumber, ARow,
    ASelect, ATooltip,
    ExclamationCircleOutlined,
    SearchOutlined
  } from "#components";
  import {Switch} from "ant-design-vue";
  import {createNewMovementService} from "~/composables/Inventory/movement.service";
  import type {SelectProps} from "ant-design-vue/lib";
  import type {ICategory} from "~/composables/settings/Category/Category.interface";
  import {getAllCategory} from "~/composables/settings/Category/category.service";
  import {STCodeList} from "~/composables/Status.interface";
  import type {IUnit} from "~/composables/settings/Unit/Unit.interface";
  import {getAllUnit} from "~/composables/settings/Unit/unit.service";
  import type {ICurrency} from "~/composables/settings/general/settings.interface";
  import {getCurrencyService} from "~/composables/settings/general/settings.service";
  import {translations} from "~/composables/translations";
  import {useThreshold} from "~/composables/states";
  import {CheckOutlined, CloseOutlined} from "@ant-design/icons-vue";

  //**************Beginning of state management**************
  //This is a global state for language of the app
  const language = useLanguage();
  const loading = ref<boolean>(false);
  const loadingDetailsMovement = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const loadingCategoryFilterList = ref<boolean>(false);
  const loadingUnitFilterList = ref<boolean>(false);
  const isOpenModalPannier = ref<boolean>(false);
  const keyword = ref<string>('');
  const pageSize = ref<number>(10);
  const currentPage = ref<number>(1);
  const totalPage = ref<number>(0);
  const dataProductWithRemainingStock = ref<IProductRemainingStock[]>([]);
  const dataDetailsMovement = ref<IDetails[]>([]);
  const itemInPannier = ref<number>(0);
  const amountDetail = ref<string>('');
  const errorMessageDetails = ref<string>('');
  const isShowErrorDetail = ref<boolean>(false);
  const optionsCategory = ref<SelectProps['options']>([{ value: '', label: translations[language.value].all }]);
  const currentCategoryList = ref<string>('');
  const optionsUnit = ref<SelectProps['options']>([{ value: '', label: translations[language.value].all }]);
  const currentUnitList = ref<string>('');
  const stockThreshold = useThreshold();
  const currencyType = ref<string>('');
  //**************End of state management**************

  //***********Beginning of select method of category product***************
  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };

  const handleChangeFilterCategoryInList = () => {
    currentPage.value = 1;
    getAllDataProductWithRemainingStock();
  };

  const handleChangeFilterUnitInList = () => {
    currentPage.value = 1;
    getAllDataProductWithRemainingStock();
  };
  //***********End of select method of category product***************

  //**************Beginning of Datatable column**************
  const columnsProductWithRemainingStock = computed<any>(() =>[
    {
      title: translations[language.value].product,
      key: 'product',
      dataIndex: 'product_name',
      width: 200,
      fixed: 'left',
    },
    {
      title: 'Code',
      key: 'code',
      dataIndex: 'code',
      width: 170,
    },
    {
      title: translations[language.value].category,
      key: 'category',
      dataIndex: 'category_name',
      width: 150,
    },
    {
      title: translations[language.value].unit,
      key: 'unit',
      dataIndex: 'unit_name',
      width: 150,
    },
    {
      title: translations[language.value].unitPrice,
      key: 'unitPrice',
      dataIndex: 'unit_price',
      width: 300,
      customRender: ({ record }: { record: IProductRemainingStock}) => {
        const value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.unit_price ? record.unit_price : 0);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: translations[language.value].wholesalePrice,
      key: 'wholesalePrice',
      dataIndex: 'wholesale_price',
      width: 300,
      customRender: ({ record }: { record: IProductRemainingStock}) => {
        const value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.wholesale_price ? record.wholesale_price : 0);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].remainingStock]),
      key: 'remainingStock',
      dataIndex: 'remaining_stock',
      width: 120,
      customRender: ({ record }: { record: IProductRemainingStock}) => [
        h('div', {
          style: { textAlign: 'center', color: 'white', fontWeight: '800', borderRadius: '10px' },
          class: record.remaining_stock <= stockThreshold.value ? 'danger-background-color' : 'primary-background-color',
        }, [
          h('span', [record.remaining_stock]),
        ]),
      ]
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 80,
      fixed: 'right',
      customRender: ({ record }: { record: IProductRemainingStock }) => {
        const pannierStorage = localStorage.getItem('pannierSales');
        //If pannier is not empty, we need to check if record is not already there
        if (pannierStorage && pannierStorage !== '') {
          const pannierList: IProductRemainingStock[] = JSON.parse(pannierStorage);
          //Find record item in pannierList
          const findRecordInPannier = pannierList.find(item => item.product_id === record.product_id);

          if (findRecordInPannier) {
            //if already exist, we return the remove btn
            return h(ATooltip, { title: translations[language.value].remove, color: '#ff5959' }, [
              h(AButton, {
                class: 'btn--danger',
                disabled: record.remaining_stock === 0, onClick: () => handleRemoveItemPannier(record)
              }, [h(CloseOutlined)])
            ]);
          } else {
            //record not exist in pannier we return the add btn
            return h(ATooltip, { title: translations[language.value].select, color: 'blue' }, [
              h(AButton, {
                class: 'btn--primary',
                disabled: record.remaining_stock === 0, onClick: () => handleAddItemPannier(record)
              }, [h(CheckOutlined)])
            ]);
          }
        } else {
          //If pannier is empty we return the add btn
          return h(ATooltip, { title: translations[language.value].select, color: 'blue' }, [
            h(AButton, {
              class: 'btn--primary',
              disabled: record.remaining_stock === 0, onClick: () => handleAddItemPannier(record)
            }, [h(CheckOutlined)])
          ]);
        }
      }
    },
  ]);

  const columnsDetailsMovement = computed<any>(() => [
    {
      title: translations[language.value].product,
      key: 'product',
      dataIndex: 'product_name',
      width: 200,
      fixed: 'left',
    },
    {
      title: translations[language.value].category,
      key: 'category',
      dataIndex: 'category_name',
      width: 100,
    },
    {
      title: translations[language.value].unit,
      key: 'unit',
      dataIndex: 'unit_name',
      width: 100,
    },
    {
      title: translations[language.value].unitPrice,
      key: 'unitPrice',
      dataIndex: 'unit_price',
      width: 170,
      customRender: ({ record }: { record: IDetails}) => {
        const value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.unit_price ? record.unit_price : 0);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: translations[language.value].wholesalePrice,
      key: 'wholesalePrice',
      dataIndex: 'wholesale_price',
      width: 170,
      customRender: ({ record }: { record: IDetails}) => {
        const value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.wholesale_price ? record.wholesale_price : 0);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: translations[language.value].priceType,
      key: 'priceType',
      dataIndex: 'is_unit_price',
      width: 180,
      customRender: ({ record }: { record: IDetails }) => {
        return h(Switch, {
          checked: record.is_unit_price,
          'checked-children': translations[language.value].unitaryPriceType,
          'un-checked-children': translations[language.value].wholesalePriceType,
          onChange: () => {
            record.is_unit_price = !record.is_unit_price;
            //We need to reload the amount of details
            getAmountDetails();
          },
        });
      },
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].remainingStock]),
      key: 'remainingStock',
      dataIndex: 'remaining_stock',
      width: 100,
      customRender: ({ record }: { record: IDetails}) => [
        h('div', {
          style: { textAlign: 'center', color: 'white', fontWeight: '800', borderRadius: '10px' },
          class: record.remaining_stock <= stockThreshold.value ? 'danger-background-color' : 'primary-background-color',
        }, [
          h('span', [record.remaining_stock]),
        ]),
      ]
    },
    {
      title: translations[language.value].quantity,
      key: 'quantity',
      dataIndex: 'quantity',
      width: 120,
      customRender: ({ record }: { record: IDetails }) => {
        return h(AInputNumber, {
          value: record.quantity,
          class: 'ant-input-status-error',
          min: 0,
          max: record.remaining_stock,
          onChange: (value: any) => {
            //Guard of max quantity
            if (record.quantity > record.remaining_stock) {
              record.quantity = 0;
            } else {
              record.quantity = value ? value : 0;
            }

            //We need to reload the amount of details
            getAmountDetails();
          },
        });
      },
    },
    {
      title: translations[language.value].amount,
      key: 'amount',
      width: 170,
      customRender: ({ record }: { record: IDetails}) => {
        const price = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.is_unit_price ? (record.unit_price * record.quantity) : (record.wholesale_price * record.quantity));

        return h('div', { style: { textAlign: 'right' } }, [`${price} ${currencyType.value}`]);
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      fixed: 'right',
      customRender: ({ record }: { record: IDetails }) => h('row',
          {
            class: 'flex justify-center',
          },
          [
            h(ATooltip, { title: translations[language.value].remove, color: '#ff5959' }, [
              h(AButton, {
                class: 'btn--danger-outline btn-tab',
                size: 'large',
                onClick: () => handleRemoveItemDetails(record)
              }, [h(CloseOutlined)])
            ])
          ]
      )
    },
  ]);
  //**************End of Datatable column**************

  //******************Beginning action pannier********************
  const handleAddItemPannier = async (record: IProductRemainingStock) => {
    const newDataPannier: IDetails = {
      product_id: record.product_id,
      product_name: record.product_name,
      quantity: 0,
      category_id: record.category_id,
      category_name: record.category_name,
      unit_id: record.unit_id,
      unit_name: record.unit_name,
      is_unit_price: true,
      product_sales_price_id: record.product_sales_price_id,
      unit_price: record.unit_price,
      wholesale_price: record.wholesale_price,
      purchase_price: record.purchase_price,
      remaining_stock: record.remaining_stock,
    };

    const pannierStorage = localStorage.getItem('pannierSales');

    if (pannierStorage) {
      let pannierList: IDetails[] = JSON.parse(pannierStorage);
      pannierList.push(newDataPannier);

      localStorage.setItem('pannierSales', JSON.stringify(pannierList));
      await updateCountPannier();
      await getAllDataProductWithRemainingStock();
    } else {
      localStorage.setItem('pannierSales', JSON.stringify([newDataPannier]));
      await updateCountPannier();
      await getAllDataProductWithRemainingStock();
    }
  }

  const handleRemoveItemPannier = async (record: IProductRemainingStock) => {
    const pannierStorage = localStorage.getItem('pannierSales');
    const pannierList: IDetails[] = pannierStorage ? JSON.parse(pannierStorage) : [];

    const updatedPannier: IDetails[] = pannierList.filter(item => item.product_id !== record.product_id);
    localStorage.setItem('pannierSales', JSON.stringify(updatedPannier));
    await updateCountPannier();
    await getAllDataProductWithRemainingStock();
  }

  const updateCountPannier = async () => {
    const pannierStorage = localStorage.getItem('pannierSales');

    if (pannierStorage) {
      const pannierList: IDetails[] = JSON.parse(pannierStorage);
      //set value with pannierList length
      itemInPannier.value = pannierList.length;
    } else {
      //rest with default value pannier not found
      itemInPannier.value = 0;
    }

  }

  const updatePannierList = async () => {
    const pannierStorage = localStorage.getItem('pannierSales');

    if (pannierStorage) {
      dataDetailsMovement.value = JSON.parse(pannierStorage);
    }

    loadingDetailsMovement.value = false;
  }

  const saveChangePannierTemporarily = async () => {
    localStorage.setItem('pannierSales', JSON.stringify(dataDetailsMovement.value));
    await updateCountPannier();
    await getAllDataProductWithRemainingStock();
  }

  const handleRemoveItemDetails = async (record: IDetails) => {
    dataDetailsMovement.value = dataDetailsMovement.value.filter(item => item.product_id !== record.product_id);
    //We need to reload the amount of details
    await getAmountDetails();
  };

  const handleShowModalPannier = async () => {
    loadingDetailsMovement.value = true;
    errorMessageDetails.value = '';
    isShowErrorDetail.value = false;
    await updatePannierList();

    isOpenModalPannier.value = true;
  }

  const handleCloseModalPannier = () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        await saveChangePannierTemporarily();
        isOpenModalPannier.value = false;
      },
      onCancel: () => {
        isOpenModalPannier.value = false;
      }
    });

  }

  const getAmountDetails = async () => {
    let amount: number = 0;
    //Browse all item to calculi amount
    dataDetailsMovement.value.map((item: IDetails) => {
      amount += item.is_unit_price ? (item.unit_price * item.quantity) : (item.wholesale_price * item.quantity);
    });
    //format total price
    const formatNumber: string =  new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);

    //set value of amountDetailState
    if (formatNumber) {
      amountDetail.value = `${formatNumber} ${currencyType.value}`;
    }
  }

  const handleSaveMovement = async () => {
    if (dataDetailsMovement.value.length > 0) {
      const indexEmptyQuantity = dataDetailsMovement.value.findIndex(item => item.quantity === 0);

      if (indexEmptyQuantity !== -1) {
        errorMessageDetails.value = translations[language.value].errorQuantity;
        isShowErrorDetail.value = true;
      } else {
        Modal.confirm({
          title: translations[language.value].confirmationTitle,
          icon: createVNode(ExclamationCircleOutlined),
          content: translations[language.value].confirmationDescription,
          okText: translations[language.value].yes,
          cancelText: translations[language.value].no,
          onOk: async () => {
            await createNewMovement(dataDetailsMovement.value);
          }
        });

      }
    } else {
      // Show error notification
      notification.warning({
        message: translations[language.value].warning,
        description: translations[language.value].errorSale,
        class: 'custom-warning-notification'
      });
    }
  }
  //**************End of action pannier**************

  //******************Beginning of CRUD controller**************
  const getAllDataProductWithRemainingStock = async () => {
    try {
      loading.value = true;
      const response: Paginate<IProductRemainingStock[]> = await getAllProductWithRemainingStockService(
          keyword.value,
          pageSize.value,
          currentPage.value,
          currentCategoryList.value,
          currentUnitList.value,
          '',
          ''
      );
      dataProductWithRemainingStock.value = response.data;
      totalPage.value = response.totalRows;
      loading.value = false;
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

  const getAllDataCategory = async () => {
    try {
      loadingCategoryFilterList.value = true;
      const response: Paginate<ICategory[]> = await getAllCategory(
          '',
          '',
          '',
          STCodeList.ACTIVE);
      response.data.map((item: ICategory) => {
        if (optionsCategory.value) {
          optionsCategory.value.push({ value: item.uuid, label: item.designation });
        }
      });

      await nextTick(); // Ensure the DOM updates before proceeding
      loadingCategoryFilterList.value = false;
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

  const getAllDataUnit = async () => {
    try {
      loadingUnitFilterList.value = true;
      const response: Paginate<IUnit[]> = await getAllUnit(
          '',
          '',
          '',
          STCodeList.ACTIVE);
      response.data.map((item: IUnit) => {
        if (optionsUnit.value) {
          optionsUnit.value.push({ value: item.uuid, label: item.designation });
        }
      });

      await nextTick(); // Ensure the DOM updates before proceeding
      loadingUnitFilterList.value = false;
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

  const createNewMovement = async (details: IDetails[]) => {
    try {
      loadingBtn.value = true;

      let data: IFormDetails[] = [];
      //Create a data dictionary
      details.forEach((item: IDetails) => {
        data.push({
          idProduct: item.product_id,
          isUnitPrice: item.is_unit_price,
          quantity: item.quantity,
        })
      })

      await createNewMovementService(
          true,
          data,
      );
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      loadingBtn.value = false;
      isOpenModalPannier.value = false;
      localStorage.setItem('pannierSales', '[]');

      await navigateTo(RouteList.INVENTORY_SALES);
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

      loadingBtn.value = false;
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
  //******************End of CRUD controller**************

  //******************Beginning of filter and paginator methods****
  const handleClickPaginator = () => {
    getAllDataProductWithRemainingStock();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllDataProductWithRemainingStock();
  };

  const handleSearch = () => {
    currentPage.value = 1;
    getAllDataProductWithRemainingStock();
  }
  //******************End filter of and paginator methods****

  // Watch the language and update the 'all' label reactively
  watchEffect(() => {
    if (optionsCategory.value) {
      optionsCategory.value[0].label = translations[language.value].all;
    }

    if (optionsUnit.value) {
      optionsUnit.value[0].label = translations[language.value].all;
    }
  });

  onMounted(() => {
    updateCountPannier();
    getCurrencyType();
    getAllDataProductWithRemainingStock();
    getAllDataCategory();
    getAllDataUnit();
  })
</script>

<template>
  <!-- Sort page, add btn, sort by category, search -->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <!-- Page size -->
    <a-col class="mt-8" span="5">
      <a-select
          ref="select"
          v-model:value="pageSize"
          style="width: 80px; text-align: center;"
          @change="handleChangePageSize"
      >
        <a-select-option value="10">10</a-select-option>
        <a-select-option value="25">25</a-select-option>
        <a-select-option value="50">50</a-select-option>
      </a-select>
      <span> / page</span>
    </a-col>
    <!-- Sort by category -->
    <a-col class="mt-8" span="6">
      <span>{{ translations[language].category }} : </span>
      <a-select
          class="w-44"
          v-model:value="currentCategoryList"
          show-search
          :options="optionsCategory"
          :filter-option="filterOption"
          @change="handleChangeFilterCategoryInList"
          :loading="loadingCategoryFilterList"
      ></a-select>
    </a-col>
    <!-- Sort by unit -->
    <a-col class="mt-8" span="6">
      <span>{{ translations[language].unit }} : </span>
      <a-select
          class="w-44"
          v-model:value="currentUnitList"
          show-search
          :options="optionsUnit"
          :filter-option="filterOption"
          @change="handleChangeFilterUnitInList"
          :loading="loadingUnitFilterList"
      ></a-select>
    </a-col>
    <!-- Search input -->
    <a-col class="mt-8 flex justify-end" span="6">
      <a-input type="text" class="w-48 h-9" v-model:value="keyword" :placeholder="translations[language].search"/>&nbsp;
      <a-button class="btn--primary" :icon="h(SearchOutlined)" @click="handleSearch"/>
    </a-col>
    <!-- Pannier -->
    <a-col class="mt-8">
      <a-badge :count="itemInPannier" show-zero @click="handleShowModalPannier">
        <ShoppingCartOutlined style="font-size: 32px;"/>
      </a-badge>
    </a-col>
  </a-row>
  <!-- Datatable -->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col class="mt-8" span="24">
      <a-spin :spinning="loading" size="large">
        <a-table
            class="w-full"
            :columns="columnsProductWithRemainingStock"
            :data-source="dataProductWithRemainingStock"
            :pagination="false"
            :scroll="{ x: 1200, y: 1000 }"
            bordered
        />
      </a-spin>
    </a-col>
  </a-row>
  <!-- Pagination -->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col class="mt-8 flex justify-end" span="24">
      <a-pagination
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="totalPage"
          @prevClick="handleClickPaginator"
          @change="handleClickPaginator"
          @nextClick="handleClickPaginator"
          :showSizeChanger="false" />
    </a-col>
  </a-row>
  <!-- Legend -->
  <a-row class="mt-8 flex justify-center" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col  span="12" class="flex justify-center">
      <div class="primary-background-color w-12 h-5 rounded-md"></div>
      <h6 class="ml-4">{{ translations[language].productAvailable }}</h6>
    </a-col>
    <a-col  span="12" class="flex justify-center">
      <div class="danger-background-color w-12 h-5 rounded-md"></div>
      <h6 class="ml-4">{{ translations[language].productOutOfStock }}</h6>
    </a-col>
  </a-row>
  <!--Pannier Modal-->
  <a-modal
      v-model:open="isOpenModalPannier"
      v-if="isOpenModalPannier"
      :maskClosable="false"
      :closable="false"
      :footer="null"
      style="top: 20px"
      width="1300px"
      title="Pannier"
  >
    <!--Datatable details movement-->
    <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="24">
        <a-spin :spinning="loadingDetailsMovement" size="large">
          <a-table
              class="w-full"
              :columns="columnsDetailsMovement"
              :data-source="dataDetailsMovement"
              :pagination="false"
              :scroll="{ x: 1200, y: 1000 }"
              bordered
          />
        </a-spin>
      </a-col>
    </a-row>
    <!-- Amount row -->
    <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="8">
        <p style="font-size: 18px;">Total : {{ amountDetail }}</p>
      </a-col>
      <!-- Legend -->
      <a-col class="mt-8 flex" span="16">
        <a-col  span="12" class="flex">
          <div class="primary-background-color w-12 h-4 rounded-md"></div>
          <h6 class="ml-4">{{ translations[language].productAvailable }}</h6>
        </a-col>
        <a-col  span="12" class="flex">
          <div class="danger-background-color w-12 h-4 rounded-md"></div>
          <h6 class="ml-4">{{ translations[language].productOutOfStock }}</h6>
        </a-col>
      </a-col>
    </a-row>
    <!-- Action modal of details -->
    <a-row class="mt-8" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="24">
        <a-button class="btn btn--default" size="middle" @click="handleCloseModalPannier">{{ translations[language].cancel }}</a-button>
        <a-button
            class="btn btn--primary ml-4"
            html-type="submit"
            size="middle"
            :loading="loadingBtn"
            @click="handleSaveMovement"
        >{{ translations[language].save }}</a-button>
        <span class="danger-color ml-5" style="font-size: 18px;" v-if="isShowErrorDetail">{{ errorMessageDetails }}</span>
      </a-col>
    </a-row>
  </a-modal>
</template>

<style scoped>

</style>