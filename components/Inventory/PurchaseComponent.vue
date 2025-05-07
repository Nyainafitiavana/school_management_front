<script setup lang="ts">
  import {createVNode, h, type UnwrapRef} from 'vue';
  import {
    AButton,
    AInputNumber, ASelect, ATooltip,
  } from "#components";
  import type {SelectValue} from "ant-design-vue/es/select";
  import {handleInAuthorizedError} from "~/composables/CustomError";
  import type {Paginate} from "~/composables/apiResponse.interface";
  import {type FormInstance} from "ant-design-vue";
  import {STCodeList, type TStatus} from "~/composables/Status.interface";
  import type {
    IDetails,
    IFormDetails,
    IFormReject,
    IHistoryValidation,
    IMovement
  } from "~/composables/Inventory/Movement.interface";
  import {
    getAllDetailsMovementService, getAllHistoryValidationMovementService,
    getAllMovementService,
    updateDetailMovementService, validateOrRejectMovementService
  } from "~/composables/Inventory/movement.service";
  import {formatDateString} from "~/composables/helper";
  import type {SelectProps} from "ant-design-vue/lib";
  import type {IProductRemainingStock} from "~/composables/settings/Product/Product.interface";
  import {getAllProductWithRemainingStockService} from "~/composables/settings/Product/product.service";
  import type {RangeValue} from "~/composables/dayJs.type";
  import type {ICurrency} from "~/composables/settings/general/settings.interface";
  import {getCurrencyService} from "~/composables/settings/general/settings.service";
  import {translations} from "~/composables/translations";
  import {useThreshold} from "~/composables/states";
  import {
    CheckOutlined,
    CloseOutlined,
    ExclamationCircleOutlined, FilterOutlined,
    HistoryOutlined,
    InfoOutlined, PlusOutlined,
    StopOutlined
  } from "@ant-design/icons-vue";


  interface Props {
    activePage: TStatus;
  }


  const props = defineProps<Props>();

  //**************Beginning of state management**************
  //This is a global state for language of the app
  const language = useLanguage();
  const dateFilter = ref<RangeValue>();
  const isAdmin = ref<string>('');
  const loading = ref<boolean>(false);
  const loadingDetailsMovement = ref<boolean>(false);
  const loadingHistoryValidation = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const pageSizeMovement = ref<number>(10);
  const currentPageMovement = ref<number>(1);
  const totalPageMovement = ref<number>(0);
  const dataMovement = ref<IMovement[]>([]);
  const dataDetailsMovement = ref<IDetails[]>([]);
  const dataProductWithRemainingStock = ref<IProductRemainingStock[]>([]);
  const dataHistoryValidation = ref<IHistoryValidation[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isOpenModalReject = ref<boolean>(false);
  const isOpenModalHistoryValidation = ref<boolean>(false);
  const movementId = ref<string>('');
  const amountDetail = ref<string>('');
  const optionsProductDetails = ref<SelectProps['options']>([]);
  const isShowErrorDetail = ref<boolean>(false);
  const errorMessageDetails = ref<string>('');
  const stockThreshold = useThreshold();
  const currencyType = ref<string>('');
  const formStateReject: UnwrapRef<IFormReject> = reactive({
    observation: '',
  });
  const formRef = ref<FormInstance>();
  //**************End of state management**************
  //**************Beginning of Column datatable property***********
  const activeActionsColumns = {
    title: 'Actions',
    key: 'actions',
    width: 300,
    customRender: ({ record }: { record: IMovement }) => h('a-row', [
      h(ATooltip, { title: translations[language.value].ValidationHistory, color: 'blue' }, [
        h(AButton, {
          class: 'btn--primary-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewHistoryValidationMovement(record)
        }, [h(HistoryOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].purchaseDetails, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewDetailsMovement(record)
        }, [h(InfoOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].confirm, color: '#38c172' }, [
        h(AButton, {
          class: 'btn--success-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleValidateMovement(record)
        }, [h(CheckOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].reject, color: '#ff5959' }, [
        h(AButton, {
          class: 'btn--danger-outline btn-tab',
          size: 'middle',
          onClick: () => handleRejectMovement(record)
        }, [h(StopOutlined)])
      ]),
    ])
  };

  const validatedActionColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    customRender: ({ record }: { record: IMovement }) => h('div', [
      h(ATooltip, { title: translations[language.value].ValidationHistory, color: 'blue' }, [
        h(AButton, {
          class: 'btn--primary-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewHistoryValidationMovement(record)
        }, [h(HistoryOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].purchaseDetails, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewDetailsMovement(record)
        }, [h(InfoOutlined)]),
      ]),
    ])
  };

  const rejectOrCompletedActionColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    customRender: ({ record }: { record: IMovement }) => h('div', [
      h(ATooltip, { title: translations[language.value].ValidationHistory, color: 'blue' }, [
        h(AButton, {
          class: 'btn--primary-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewHistoryValidationMovement(record)
        }, [h(HistoryOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].purchaseDetails, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewDetailsMovement(record)
        }, [h(InfoOutlined)]),
      ]),
    ])
  };

  let columnsMovement = computed(() => []);

  const columnsDetailsMovement = computed(() => [
    {
      title: translations[language.value].product,
      key: 'product',
      dataIndex: 'product_name',
      width: 200,
      customRender: ({ record }: { record: IDetails}) => [
        h(ASelect, {
          disabled: props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'false' || props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.COMPLETED || props.activePage === STCodeList.REJECTED && isAdmin.value === 'true',
          style:'width: 100%',
          'placeholder': translations[language.value].selectProduct,
          'show-search': true,
          value: record.product_id,
          options: optionsProductDetails.value,
          'filter-option': filterOption,
          onSelect: (value: any) => {
            changeItemDetails(value, record);
          }
        })
      ]
    },
    {
      title: translations[language.value].category,
      key: 'category',
      dataIndex: 'category_name',
    },
    {
      title: translations[language.value].unit,
      key: 'unit',
      dataIndex: 'unit_name',
      width: 100,
    },
    {
      title: translations[language.value].purchasePrice,
      key: 'purchasePrice',
      dataIndex: 'purchase_price',
      customRender: ({ record }: { record: IDetails}) => {
        const value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.purchase_price ? record.purchase_price : 0);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].remainingStock]),
      key: 'remainingStock',
      dataIndex: 'remaining_stock',
      width: 150,
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
          disabled: record.purchase_price === 0 || props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'false' || props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.REJECTED && isAdmin.value === 'true',
          value: record.quantity,
          class: 'ant-input-status-error',
          min: 0,
          onChange: (value: any) => {
              record.quantity = value ? value : 0;
            //We need to reload the amount of details
            getAmountDetails();
          },
        });
      },
    },
    {
      title: translations[language.value].amount,
      key: 'amount',
      customRender: ({ record }: { record: IDetails}) => {
        const value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.purchase_price ? (record.purchase_price * record.quantity) : 0);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 100,
      customRender: ({ record }: { record: IDetails }) => h('row',
          {
            class: 'flex justify-center',
          },
          [
            h(ATooltip, { title: translations[language.value].remove, color: '#ff5959' }, [
              h(AButton, {
                disabled: props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'false' || props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.REJECTED && isAdmin.value === 'true',
                class: 'btn--danger-outline btn-tab',
                size: 'middle',
                onClick: () => handleRemoveItemDetails(record)
              }, [h(CloseOutlined)])
            ]),
          ]
      )
    },
  ]);

  const columnsHistoryValidation = computed(() => [
    {
      title: 'Date',
      key: 'createdAt',
      dataIndex: 'createdAt',
      customRender: ({ record }: { record: IHistoryValidation}) => {
        const createdAt: string = formatDateString(record.createdAt, language.value, true);
        return h('div', {style: {textAlign: 'left'}}, [createdAt]);
      }
    },
    {
      title: translations[language.value].validator,
      key: 'validator',
      dataIndex: 'validator',
      customRender: ({ record }: { record: IHistoryValidation}) => [record.validator ? record.validator.firstName + ' ' + record.validator.lastName : '---'],
    },
    {
      title: 'Observation',
      key: 'observation',
      dataIndex: 'observation',
      customRender: ({ record }: { record: IHistoryValidation}) => [record.observation ? record.observation : '---'],
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      width: 120,
      customRender: ({ record }: { record: IMovement}) => h('a-row', [
        record.status.code === STCodeList.IN_PROGRESS ?
            h('div',
                {
                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                  class: 'info-background-color'
                },
                [translations[language.value].inProgress]
            )
            :
            (
                record.status.code === STCodeList.COMPLETED ?
                    h('div',
                        {
                          style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                          class: 'primary-background-color'
                        },
                        [translations[language.value].completed]
                    ) :
                    (
                        record.status.code === STCodeList.VALIDATED ?
                            h('div',
                                {
                                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                                  class: 'success-background-color'
                                },
                                [translations[language.value].validated]
                            ) :
                            h('div',
                                {
                                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                                  class: 'danger-background-color'
                                },
                                [translations[language.value].rejected]
                            )
                    )

            )
      ])
    },
  ]);

  //**********Init column of datatable*****************
  const initColumnDatableMovement = () => {
    columnsMovement = computed<any>(() => [
      {
        title: 'Type',
        key: 'isSales',
        dataIndex: 'isSales',
        width: 100,
        customRender: ({ record }: { record: IMovement}) => [record.isSales ? translations[language.value].sales : translations[language.value].purchase],
      },
      {
        title: 'Date',
        key: 'createdAt',
        dataIndex: 'createdAt',
        customRender: ({ record }: { record: IMovement}) => {
          const createdAt: string = formatDateString(record.createdAt, language.value, true);
          return h('div', {style: {textAlign: 'left'}}, [createdAt]);
        }
      },
      {
        title: translations[language.value].editor,
        key: 'editor',
        dataIndex: 'editor',
        customRender: ({ record }: { record: IMovement}) => [record.editor.firstName + ' ' + record.editor.lastName],
      },
      {
        title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
        key: 'status',
        width: 120,
        customRender: ({ record }: { record: IMovement}) => h('a-row', [
          record.status.code === STCodeList.IN_PROGRESS ?
              h('div',
                  {
                    style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                    class: 'info-background-color'
                  },
                  [translations[language.value].inProgress]
              )
              :
              (
                  record.status.code === STCodeList.COMPLETED ?
                      h('div',
                          {
                            style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                            class: 'primary-background-color'
                          },
                          [translations[language.value].completed]
                      ) :
                      (
                          record.status.code === STCodeList.VALIDATED ?
                              h('div',
                                  {
                                    style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                                    class: 'success-background-color'
                                  },
                                  [translations[language.value].validated]
                              ) :
                              h('div',
                                  {
                                    style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                                    class: 'danger-background-color'
                                  },
                                  [translations[language.value].rejected]
                              )
                      )

              )
        ])
      },
      props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'true' ?
          activeActionsColumns :
          (
              (props.activePage === STCodeList.VALIDATED && isAdmin.value === 'true') ?
                  validatedActionColumns : rejectOrCompletedActionColumns
          ),
    ]);
  }
  //**************End of Column datatable property***********

  //**********Reset all value and validator form*******
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  };

  //************Add button action*********
  const handleAdd = () => {
    navigateTo(RouteList.INVENTORY_PURCHASE_NEW);
  }


  //************Beginning of actions datatable button method**********
  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };

  const handleViewDetailsMovement = (record: IMovement) => {
    movementId.value = record.uuid;
    getAllDetailsMovement();
    getAllProductWithRemainingStock();
    handleShowModalDetails();
  };

  const handleViewHistoryValidationMovement = (record: IMovement) => {
    movementId.value = record.uuid;
    getAllHistoryMovement();
    handleShowModalHistoryValidation();
  };

  const changeItemDetails = (value: string, record: IDetails) => {
    const findSelectProductInDetails = dataDetailsMovement.value.find(item => item.product_id === value);

    if (findSelectProductInDetails) {
      notification.error({
        message: translations[language.value].error,
        description: translations[language.value].selectProductError,
        class: 'custom-error-notification'
      });

      record.product_id = '';
      record.product_name = '';
      record.quantity = 0;
      record.category_id = '';
      record.category_name = '';
      record.unit_id = '';
      record.unit_name = '';
      record.is_unit_price = true;
      record.product_sales_price_id = '';
      record.unit_price = 0;
      record.wholesale_price = 0;
      record.purchase_price = 0;
      record.remaining_stock = 0;
    } else {
      //find a product in dataProductWithRemainingStock to make an update of details item
      const findProduct = dataProductWithRemainingStock.value.find(product => product.product_id === value);

      if (findProduct) {
        record.product_id = findProduct.product_id;
        record.product_name = findProduct.product_id;
        record.quantity = 0;
        record.category_id = findProduct.category_id;
        record.category_name = findProduct.category_name;
        record.unit_id = findProduct.unit_id;
        record.unit_name = findProduct.unit_name;
        record.is_unit_price = true;
        record.product_sales_price_id = findProduct.product_sales_price_id;
        record.unit_price = findProduct.unit_price;
        record.wholesale_price = findProduct.wholesale_price;
        record.purchase_price = findProduct.purchase_price;
        record.remaining_stock = findProduct.remaining_stock;
      }
    }
  }

  const handleAddNewItemDetails = () => {
    //find in detail if a row is not completed, so we can't create a new row
    const findProduct = dataDetailsMovement.value.find(product => product.product_id === '');

    if (findProduct) {
      // Show error notification
      notification.error({
        message: translations[language.value].error,
        description: translations[language.value].addRowDetailsError,
        class: 'custom-error-notification'
      });
    } else {
      dataDetailsMovement.value.push({
        product_id: '',
        product_name: '',
        quantity: 0,
        category_id: '',
        category_name: '',
        unit_id: '',
        unit_name: '',
        is_unit_price: true,
        product_sales_price_id: '',
        unit_price: 0,
        wholesale_price: 0,
        purchase_price: 0,
        remaining_stock: 0,
      })
    }
  }

  const handleRemoveItemDetails = (record: IDetails) => {
    dataDetailsMovement.value = dataDetailsMovement.value.filter(item => item.product_id !== record.product_id);
    //We need to reload the amount of details
    getAmountDetails();
  };

  const handleValidateMovement = (record: IMovement) => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loading.value = true;
        await validateOrRejectMovement(record.uuid, true, null);
        loading.value = false;
      }
    });
  };

  const handleRejectMovement = (record: IMovement) => {
    movementId.value = record.uuid;
    resetForm();
    formStateReject.observation = '';
    handleShowModalReject();
  };
  //************End of actions datatable button method**********

  //************Beginning of modal actions*********************
  const handleShowModalDetails = () => {
    isOpenModal.value = true;
  }

  const handleCloseModalDetails = () => {
    isOpenModal.value = false;
  }

  const handleShowModalHistoryValidation = () => {
    isOpenModalHistoryValidation.value = true;
  }

  const handleShowModalReject = () => {
    isOpenModalReject.value = true;
  }

  const handleCloseModalReject = () => {
    isOpenModalReject.value = false;
  }

  const handleSaveChangeDetails = () => {
    //Verify if we have a details with the movement
    if (dataDetailsMovement.value.length > 0) {
      //Check if an item of the details contains empty product_id
      const indexEmptyProduct = dataDetailsMovement.value.findIndex(item => item.product_id === '' || item.quantity === 0);

      if (indexEmptyProduct !== -1) {
        errorMessageDetails.value = `You have not selected a product or the quantity is not greater than 0 in the ${indexEmptyProduct + 1} line`;
        isShowErrorDetail.value = true;
      } else {
        isShowErrorDetail.value = false;
        Modal.confirm({
          title: translations[language.value].confirmationTitle,
          icon: createVNode(ExclamationCircleOutlined),
          content: translations[language.value].confirmationDescription,
          okText: translations[language.value].yes,
          cancelText: translations[language.value].no,
          onOk: async () => {
            loadingBtn.value = true;
            await updateDetailsMovement();
          }
        });
      }
    } else {
      // Show error notification
      notification.error({
        message: 'Error',
        description: "Can't update an movement without details!",
        class: 'custom-error-notification'
      });
    }
  }

  const onFinishReject = () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await validateOrRejectMovement(movementId.value, false, formStateReject);
        loadingBtn.value = false;
        handleCloseModalReject();
      }
    });
  }
  //************End of modal actions*********************

  //******************Beginning of CRUD controller**************

  const getAllDataMovement = async () => {
    try {
      loading.value = true;
      let startDateStr: string = '';
      let endDateStr: string = '';

      if (dateFilter.value) {
        const [startDate, endDate] = dateFilter.value;
        startDateStr = startDate.format('YYYY-MM-DD');
        endDateStr = endDate.format('YYYY-MM-DD');
      }

      const response: Paginate<IMovement[]> = await getAllMovementService(
          false,
          pageSizeMovement.value,
          currentPageMovement.value,
          props.activePage,
          startDateStr,
          endDateStr
      );
      dataMovement.value = response.data;
      totalPageMovement.value = response.totalRows;
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

  const getAllDetailsMovement = async () => {
    try {
      loadingDetailsMovement.value = true;
      dataDetailsMovement.value = await getAllDetailsMovementService(movementId.value);
      //We need to reload the amount of details
      await getAmountDetails();
      loadingDetailsMovement.value = false;
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

  const getAllHistoryMovement = async () => {
    try {
      loadingHistoryValidation.value = true;
      dataHistoryValidation.value = await getAllHistoryValidationMovementService(movementId.value);
      loadingHistoryValidation.value = false;
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
      loadingHistoryValidation.value = false;
    }
  }

  const getAllProductWithRemainingStock = async () => {
    try {
      const response: Paginate<IProductRemainingStock[]> = await getAllProductWithRemainingStockService(
          '',
          null,
          null,
          '',
          '',
          '',
          ''
      );
      //Keep all data
      dataProductWithRemainingStock.value = response.data;
      //Format data to the options of select product
      response.data.map((item: IProductRemainingStock) => {
        if (optionsProductDetails.value) {
          optionsProductDetails.value.push({ value: item.product_id, label: item.product_name });
        }
      });
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

  const updateDetailsMovement = async () => {
    try {
      let data: IFormDetails[] = [];
      //Create a data dictionary
      dataDetailsMovement.value.forEach((item: IDetails) => {
        data.push({
          idProduct: item.product_id,
          isUnitPrice: item.is_unit_price,
          quantity: item.quantity,
        })
      })

      await updateDetailMovementService(movementId.value, data);

      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      loadingBtn.value = false;

      handleCloseModalDetails();
      //Reload data movement
      await getAllDataMovement();
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

  const validateOrRejectMovement = async (movementId: string, isValidate: boolean, observation: IFormReject | null) => {
    try {
      await validateOrRejectMovementService(movementId, isValidate, observation);
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //Reload data movement
      await getAllDataMovement();
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
      loading.value = false;
    }
  }

  const getAmountDetails = async () => {
    let amount: number = 0;
    //Browse all item to calculi amount
    dataDetailsMovement.value.map((item: IDetails) => {
      amount += item.purchase_price ? item.purchase_price * item.quantity : 0;
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
  //******************End of CRUD controller********************

  //******************Beginning of filter and paginator methods****
  const handleClickPaginatorMovement = () => {
    getAllDataMovement();
  };

  const handleChangePageSizeMovement = (value: SelectValue) => {
    pageSizeMovement.value = Number(value);
    currentPageMovement.value = 1;
    getAllDataMovement();
  };

  const handleFilterByDate = () => {
    getAllDataMovement();
  }
  //******************End filter of and paginator methods****


  onMounted(() => {
    isAdmin.value = localStorage.getItem('is_admin') ? localStorage.getItem('is_admin') as string : '';

    initColumnDatableMovement();
    getCurrencyType();
    getAllDataMovement();
  })
</script>

<template>
  <!--Filter datatable-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <!--Page size select-->
    <a-col class="mt-8" span="8">
      <a-select
          ref="select"
          v-model:value="pageSizeMovement"
          style="width: 80px; text-align: center;"
          @change="handleChangePageSizeMovement"
      >
        <a-select-option value="10">10</a-select-option>
        <a-select-option value="25">25</a-select-option>
        <a-select-option value="50">50</a-select-option>
      </a-select>
      <span> / page</span>
    </a-col>
    <!--Add btn-->
    <a-col class="mt-8" span="4">
      <a-button :icon="h(PlusOutlined)" @click="handleAdd" v-if="props.activePage === STCodeList.IN_PROGRESS" class="btn--success ml-5">
        {{ translations[language].makePurchase }}</a-button>
    </a-col>
    <!--Filter by date-->
    <a-col class="mt-8 flex justify-end" span="12">
      <a-range-picker
          v-model:value="dateFilter"
          :placeholder="[translations[language].startDate, translations[language].endDate]"
      />
      <a-button class="btn--primary ml-2" :icon="h(FilterOutlined)" @click="handleFilterByDate"/>
    </a-col>
  </a-row>
  <!--Datatable-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col class="mt-8" span="24">
      <a-spin :spinning="loading" size="large">
        <a-table
            class="w-full"
            :columns="columnsMovement"
            :data-source="dataMovement"
            :pagination="false"
            :scroll="{ x: 1000, y: 1000 }"
            bordered
        />
      </a-spin>
    </a-col>
  </a-row>
  <!--Paginator datatable-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col class="mt-8 flex justify-end" span="24">
      <a-pagination
          v-model:current="currentPageMovement"
          v-model:pageSize="pageSizeMovement"
          :total="totalPageMovement"
          @prevClick="handleClickPaginatorMovement"
          @change="handleClickPaginatorMovement"
          @nextClick="handleClickPaginatorMovement"
          :showSizeChanger="false" />
    </a-col>
  </a-row>
  <!--Details Modal-->
  <a-modal
      v-model:open="isOpenModal"
      v-if="isOpenModal"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      width="1300px"
  >
    <!-- Template title modal -->
    <template #title>
      <span>{{ translations[language].purchaseDetails }}</span>
      <a-tooltip :title="translations[language].addProduct" :color="'#38c172'">
        <a-button
            class="btn--success ml-4"
            :icon="h(PlusOutlined)"
            @click="handleAddNewItemDetails"
            size="middle"
            v-if="props.activePage === STCodeList.IN_PROGRESS && isAdmin === 'true' || props.activePage === STCodeList.REJECTED && isAdmin !== 'true'"
        >
        </a-button>
      </a-tooltip>
    </template>
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
        <a-col  span="8" class="flex">
          <div class="primary-background-color w-12 h-4 rounded-md"></div>
          <h6 class="ml-4">{{ translations[language].productAvailable }}</h6>
        </a-col>
        <a-col  span="8" class="flex">
          <div class="danger-background-color w-12 h-4 rounded-md"></div>
          <h6 class="ml-4">{{ translations[language].productOutOfStock }}</h6>
        </a-col>
      </a-col>
    </a-row>
    <!-- Action modal of details -->
    <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="24">
        <a-button class="btn btn--secondary-outline" size="middle" @click="handleCloseModalDetails">{{ translations[language].cancel }}</a-button>
        <a-button
            class="btn btn--primary ml-4"
            html-type="submit"
            size="middle"
            :loading="loadingBtn"
            @click="handleSaveChangeDetails"
            v-if="props.activePage === STCodeList.IN_PROGRESS && isAdmin === 'true' || props.activePage === STCodeList.REJECTED && isAdmin !== 'true'"
        >{{ translations[language].save }}</a-button>
        <span class="danger-color ml-5" style="font-size: 18px;" v-if="isShowErrorDetail">{{ errorMessageDetails }}</span>
      </a-col>
    </a-row>
  </a-modal>
  <!--Reject Modal-->
  <a-modal
      v-model:open="isOpenModalReject"
      v-if="isOpenModalReject"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      :title="translations[language].rejectModalTitle"
  >
    <a-form
        :model="formStateReject"
        name="basic"
        autocomplete="off"
        @finish="onFinishReject"
        ref="formRef"
    >
      <a-form-item
          class="mt-5"
          label="Observation"
          name="observation"
          :rules="[{ required: true, message: translations[language].observationError }]"
      >
        <a-textarea v-model:value="formStateReject.observation" />
      </a-form-item>
      <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
        <a-col class="mt-8" span="24">
          <a-button class="btn btn--default" size="middle" @click="handleCloseModalReject">{{ translations[language].cancel }}</a-button>
          <a-button
              class="btn btn--primary ml-4"
              html-type="submit"
              size="middle"
              :loading="loadingBtn"
          >{{ translations[language].save }}</a-button>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
  <!--Validation history Modal-->
  <a-modal
      v-model:open="isOpenModalHistoryValidation"
      v-if="isOpenModalHistoryValidation"
      :title="translations[language].ValidationHistory"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      width="1000px"
  >
    <!--Datatable details movement-->
    <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="24">
        <a-spin :spinning="loadingHistoryValidation" size="large">
          <a-table
              class="w-full"
              :columns="columnsHistoryValidation"
              :data-source="dataHistoryValidation"
              :pagination="false"
              :scroll="{ x: 800, y: 1000 }"
              bordered
          />
        </a-spin>
      </a-col>
    </a-row>
  </a-modal>
</template>

<style scoped>

</style>