<script setup lang="ts">
import {createVNode, h, type UnwrapRef} from 'vue';
import type {SelectValue} from "ant-design-vue/es/select";
import {handleInAuthorizedError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import {type FormInstance, Switch} from "ant-design-vue";
import {STCodeList, type TStatus} from "~/composables/Status.interface";
import type {
  IDetails,
  IFormDetails,
  IFormReject,
  IHistoryValidation, IInvoice, IInvoicePayload,
  IMovement
} from "~/composables/Inventory/Movement.interface";
import {
  generateInvoiceService,
  getAllDetailsMovementService,
  getAllHistoryValidationMovementService, getAllInvoiceListByMovementService,
  getAllMovementService,
  updateDetailMovementService,
  validateOrRejectMovementService
} from "~/composables/Inventory/movement.service";
import {formatDateString} from "~/composables/helper";
import type {SelectProps} from "ant-design-vue/lib";
import type {IProductRemainingStock} from "~/composables/settings/Product/Product.interface";
import {getAllProductWithRemainingStockService} from "~/composables/settings/Product/product.service";
import type {RangeValue} from "~/composables/dayJs.type";
import type {ICurrency} from "~/composables/settings/general/settings.interface";
import {getCurrencyService} from "~/composables/settings/general/settings.service";
import {translations} from "~/composables/translations";
import {
  CheckOutlined, CloseOutlined,
  ExclamationCircleOutlined, EyeOutlined,
  FilterOutlined,
  HistoryOutlined,
  InfoOutlined,
  PlusOutlined,
  SnippetsOutlined,
  StopOutlined,
} from "@ant-design/icons-vue";
import {AButton, AInputNumber, ASelect, ATooltip} from "#components";
import {EnvApiConfig} from "~/composables/Env.config";
import {useThreshold} from "~/composables/states";


interface Props {
    activePage: TStatus;
  }


  const props = defineProps<Props>();
  //**************Beginning of state management**************
  //This is a global state for language of the app
  const language = useLanguage();
  const currencyType = ref<string>('');
  const dateFilter = ref<RangeValue>();
  const isAdmin = ref<string>('');
  const loading = ref<boolean>(false);
  const loadingDetailsMovement = ref<boolean>(false);
  const loadingHistoryValidation = ref<boolean>(false);
  const loadingInvoiceMovement = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const pageSizeMovement = ref<number>(10);
  const currentPageMovement = ref<number>(1);
  const totalPageMovement = ref<number>(0);
  const dataMovement = ref<IMovement[]>([]);
  const dataDetailsMovement = ref<IDetails[]>([]);
  const dataProductWithRemainingStock = ref<IProductRemainingStock[]>([]);
  const dataHistoryValidation = ref<IHistoryValidation[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isOpenInvoiceModal = ref<boolean>(false);
  const isOpenModalReject = ref<boolean>(false);
  const isOpenModalHistoryValidation = ref<boolean>(false);
  const movementId = ref<string>('');
  const amountDetail = ref<string>('');
  const amountInvoice = ref<string>('0.00');
  const optionsProductDetails = ref<SelectProps['options']>([]);
  const isShowErrorDetail = ref<boolean>(false);
  const errorMessageDetails = ref<string>('');
  const stockThreshold = useThreshold();
  const formStateReject: UnwrapRef<IFormReject> = reactive({
    observation: '',
  });
  const formRef = ref<FormInstance>();
  const amountInvoiceNoFormat = ref<number>(0);
  const clientAmount = ref<number>(0);
  const amountReimbursed = ref<string>('0.00');
  const isClientAmountValidated = ref<boolean>(true);
  const pdfUrl = ref<string>('');
  const isOpenModalViewPdf = ref<boolean>(false);
  const clientName = ref<string>('');
  const optionsFormat = ref<SelectProps['options']>([
      { value: 'TICKET', label: 'Ticket' },
      { value: 'A4', label: 'A4' },
  ]);
  const currentFormat = ref<string>('TICKET');
  const invoiceListMovement = ref<IInvoice[]>([]);

  //**************End of state management**************
  //**************Beginning of Column datatable property***********

  const activeActionsColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    customRender: ({ record }: { record: IMovement }) => h('a-row', [
      h(ATooltip, { title: translations[language.value].ValidationHistory, color: 'blue' }, [
        h(AButton, {
          class: 'btn--primary-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewHistoryValidationMovement(record)
        }, [h(HistoryOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].salesDetails, color: '#05c5c5' }, [
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
      h(ATooltip, { title: translations[language.value].viewInvoice, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleGenerateInvoice(record)
        }, [h(SnippetsOutlined)]),
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
      h(ATooltip, { title: translations[language.value].salesDetails, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleViewDetailsMovement(record)
        }, [h(InfoOutlined)]),
      ]),
    ])
  };

  let columnsMovement = computed<any>(() => []);

  const columnsDetailsMovement = computed<any>(() => [
    {
      title: translations[language.value].product,
      key: 'product',
      dataIndex: 'product_name',
      width: 200,
      fixed: 'left',
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
          disabled: props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'false' || props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.COMPLETED || props.activePage === STCodeList.REJECTED && isAdmin.value === 'true',
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
          class: record.remaining_stock <= stockThreshold.value ? 'danger-background-color' : 'primary-background-color'
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
          disabled: props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'false' || props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.COMPLETED || props.activePage === STCodeList.REJECTED && isAdmin.value === 'true',
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
      width: 80,
      fixed: 'right',
      customRender: ({ record }: { record: IDetails }) => h('row',
          {
            class: 'flex justify-center',
          },
          [
            h(ATooltip, { title: translations[language.value].remove, color: '#ff5959' }, [
              h(AButton, {
                disabled: props.activePage === STCodeList.IN_PROGRESS && isAdmin.value === 'false' || props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.COMPLETED || props.activePage === STCodeList.REJECTED && isAdmin.value === 'true',
                class: 'btn--danger-outline btn-tab',
                size: 'middle',
                onClick: () => handleRemoveItemDetails(record)
              }, [h(CloseOutlined)])
            ]),
          ]
      )
    },
  ]);

  const columnsHistoryValidation = computed<any>(() => [
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

  const columnsInvoiceList = computed<any>(() => [
    {
      title: 'Reference',
      key: 'reference',
      dataIndex: 'reference',
    },
    {
      title: 'Date',
      key: 'createdAt',
      dataIndex: 'createdAt',
      customRender: ({ record }: { record: IInvoice}) => {
        const createdAt: string = formatDateString(record.createdAt, language.value, true);
        return h('div', {style: {textAlign: 'left'}}, [createdAt]);
      }
    },
    {
      title: translations[language.value].editor,
      key: 'editor',
      dataIndex: 'editor',
      customRender: ({ record }: { record: IInvoice}) => [`${record.editor.lastName} ${record.editor.firstName}`]
    },
    {
      title: 'Client',
      key: 'client',
      dataIndex: 'client',
      customRender: ({ record }: { record: IInvoice}) => [record.clientName ? record.clientName : '---']
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 200,
      customRender: ({ record }: { record: IInvoice }) => h('a-row', [
        h(ATooltip, { title: translations[language.value].viewInvoice, color: 'blue' }, [
          h(AButton, {
            class: 'btn--primary-outline btn-tab',
            size: 'middle',
            style: { marginRight: '8px' },
            onClick: () => handleShowInvoicePdf(record)
          }, [h(EyeOutlined)]),
        ]),
      ]),
    },
  ]);
  //**************End of Column datatable property***********

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
              (props.activePage === STCodeList.VALIDATED || props.activePage === STCodeList.COMPLETED) ?
                  validatedActionColumns : rejectOrCompletedActionColumns
          ),
    ]);
  }

  //**********Reset all value and validator form*******
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  };

  //************Add button action*********
  const handleAdd = () => {
    navigateTo(RouteList.INVENTORY_SALES_NEW);
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

  const handleGenerateInvoice = (record: IMovement) => {
    movementId.value = record.uuid;
    handleShowModalInvoice();
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
    const findProduct = dataDetailsMovement.value.find(product => !product.product_id);

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

  const handleShowInvoicePdf = (record: IInvoice) => {
    pdfUrl.value = `${EnvApiConfig.host}:${EnvApiConfig.port}${API.INVOICE_PDF}${record.fileName}` ;
    isOpenModalViewPdf.value = true;
  }
  //************End of actions datatable button method**********

  //************Beginning of modal actions*********************
  const handleShowModalDetails = () => {
    isOpenModal.value = true;
  }

  const handleShowModalInvoice = async () => {
    //Reset value of fields
    amountInvoice.value = '0.00';
    clientAmount.value = 0;
    amountReimbursed.value = '0.00';
    amountInvoiceNoFormat.value = 0;
    isClientAmountValidated.value = true;
    clientName.value = '';
    currentFormat.value = 'TICKET';
    //Open invoice modal
    isOpenInvoiceModal.value = true;
    //Get data modal
    await getAllProductWithRemainingStock();
    await getAllDetailsMovement();
    await getAmountInvoice();
    //Get list invoice
    await getAllListInvoiceByMovement();
  }

  const handleCloseModalDetails = () => {
    isOpenModal.value = false;
  }

  const handleCloseModalInvoice = () => {
    isOpenInvoiceModal.value = false;
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
        errorMessageDetails.value = translations[language.value].errorSaveDetailsSales;
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
        message: translations[language.value].error,
        description: translations[language.value].errorSale,
        class: 'custom-error-notification'
      });
    }
  }

  const handleSaveChangeDetailsInvoice = () => {
    //Verify if we have a details with the movement
    if (dataDetailsMovement.value.length > 0) {
      //Check if an item of the details contains empty product_id
      const indexEmptyProduct = dataDetailsMovement.value.findIndex(item => item.product_id === '' || item.quantity === 0);

      if (indexEmptyProduct !== -1) {
        errorMessageDetails.value = translations[language.value].errorSaveDetailsSales;
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
            await generateInvoice();
          }
        });
      }
    } else {
      // Show error notification
      notification.error({
        message: translations[language.value].error,
        description: translations[language.value].errorSale,
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

  const handleCancelNewInvoice = () => {
    showTableNewInvoice.value = false;
  };
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
          true,
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
          quantityDelivered: item.quantity_delivered,
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

  const generateInvoice = async () => {
    try {
      const data: IInvoicePayload = {
          details: dataDetailsMovement.value,
          amountPaid: amountInvoiceNoFormat.value,
          language: language.value,
          client: clientName.value,
          format: currentFormat.value,
      }

      const result = await generateInvoiceService(movementId.value, data);
      pdfUrl.value = `${EnvApiConfig.host}:${EnvApiConfig.port}${result.url}` ;
      isOpenModalViewPdf.value = true;
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      loadingBtn.value = false;
      //Close modal invoice
      await handleCloseModalInvoice();
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
      handleCloseModalInvoice();
    }
  }

  const getAllListInvoiceByMovement = async () => {
    try {
      loadingInvoiceMovement.value = true;
      const response: Paginate<IInvoice[]> = await getAllInvoiceListByMovementService(movementId.value);

      invoiceListMovement.value = response.data;
      loadingInvoiceMovement.value = false;
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
      loadingInvoiceMovement.value = false;
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

  const getAmountInvoice = async () => {
    let amountPaid: number = 0;
    //Browse all item to calculi amount
    dataDetailsMovement.value.map((item: IDetails) => {
      //Get amount to be paid
      amountPaid += item.is_unit_price ? (item.unit_price * (item.quantity ?? 0 )) : (item.wholesale_price * (item.quantity ?? 0 ));
    });
    //Keep amountPaid for reimbursed operation
    amountInvoiceNoFormat.value = amountPaid;

    //format amount paid
    const formatAmountPaid: string =  await new Intl.NumberFormat('en-US', {
      style: 'decimal',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amountPaid);
    //set value of amountDetailState
    if (formatAmountPaid) {
      amountInvoice.value = formatAmountPaid;
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

  // Watch clientAmount changed so we recalculate amountToBeReimbursed
  watch(clientAmount, async () => {
    if (clientAmount.value >= amountInvoiceNoFormat.value && clientAmount.value !== 0) {
      //Calculated amount to be reimbursed
      const amountToBeReimbursed = clientAmount.value - amountInvoiceNoFormat.value;
      //format amount to be reimbursed
      amountReimbursed.value = await new Intl.NumberFormat('en-US', {
        style: 'decimal',
        minimumFractionDigits: 2,
        maximumFractionDigits: 2,
      }).format(amountToBeReimbursed);
      //Close error if clientAmount is lower than amountInvoiceNoFormat
      isClientAmountValidated.value = true;
    } else if (!clientAmount.value || clientAmount.value === 0) {
      clientAmount.value = 0;
      isClientAmountValidated.value = true;
      amountReimbursed.value = '0.00';
    } else {
      amountReimbursed.value = '0.00';
      //Show error if clientAmount is lower than amountInvoiceNoFormat
      isClientAmountValidated.value = false;
    }
  });


  onMounted(() => {
    isAdmin.value = localStorage.getItem('is_admin') ? localStorage.getItem('is_admin') as string : '';

    getCurrencyType();
    initColumnDatableMovement();
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
    <!--Add new btn-->
    <a-col class="mt-8" span="4">
      <a-button :icon="h(PlusOutlined)" @click="handleAdd" v-if="props.activePage === STCodeList.IN_PROGRESS" class="btn--success ml-5">{{ translations[language].makeSales }}</a-button>
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
      <span>{{ translations[language].salesDetails }}</span>
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
    <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="24">
        <a-button class="btn btn--default" size="middle" @click="handleCloseModalDetails">{{ translations[language].cancel }}</a-button>
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
  <!--Invoice Modal-->
  <a-modal
      v-model:open="isOpenInvoiceModal"
      v-if="isOpenInvoiceModal"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      width="1600px"
      title="Invoice"
  >

    <!--New Invoice section-->
    <a-row class="w-full">
      <a-col span="24">
        <!--Datatable new invoice-->
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
        <!-- Legend row -->
        <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col class="mt-8 flex justify-center" span="24">
            <a-col  span="6" class="flex justify-center">
              <div class="primary-background-color w-12 h-4 rounded-md"></div>
              <h6 class="ml-4">{{ translations[language].productAvailable }}</h6>
            </a-col>
            <a-col  span="6" class="flex justify-center">
              <div class="danger-background-color w-12 h-4 rounded-md"></div>
              <h6 class="ml-4">{{ translations[language].productOutOfStock }}</h6>
            </a-col>
          </a-col>
        </a-row>
        <!-- Amount row -->
        <a-row v-if="props.activePage === 'VLD'" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col class="mt-8" span="6">
            <span style="font-size: 16px;">Client : </span>
            <a-input v-model:value="clientName" placeholder="Client" style="width: 200px"/>
          </a-col>
          <a-col class="mt-8" span="6">
            <span style="font-size: 16px;">Format : </span>
            <a-select
                ref="select"
                v-model:value="currentFormat"
                style="width: 120px"
                :options="optionsFormat"
            ></a-select>
          </a-col>
          <a-col class="mt-8" span="6">
            <p style="font-size: 16px;">{{ translations[language].amountPaid }} : {{ amountInvoice }} {{ currencyType }}</p>
          </a-col>
        </a-row>
        <!-- Client Amount row -->
        <a-row v-if="props.activePage === 'VLD'" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col class="mt-8" span="8">
            <label for="client-amount" style="font-size: 16px;">{{ translations[language].clientAmount }} : </label>
            <a-input-number
                id="client-amount"
                :status="isClientAmountValidated ? 'success' : 'error'"
                class="w-56"
                v-model:value="clientAmount"
                style="font-size: 16px;"
                :min="0"
                :disabled="amountInvoiceNoFormat == 0"
            />
            <span style="font-size: 16px;">&nbsp;{{ currencyType }}</span>
          </a-col>
          <a-col class="mt-8" span="8">
            <p style="font-size: 16px;">{{ translations[language].amountToBeReimbursed }} : {{ amountReimbursed }} {{ currencyType }}</p>
          </a-col>
        </a-row>
        <!-- Error row -->
        <a-row v-if="props.activePage === 'VLD'" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col class="mt-8" span="24">
            <p class="danger-color" style="font-size: 16px;" v-if="!isClientAmountValidated">{{ translations[language].errorClientAmount }}</p>
          </a-col>
        </a-row>
        <!-- Action modal of invoice -->
        <a-row v-if="props.activePage === 'VLD'" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
          <a-col class="mt-8" span="24">
            <a-button class="btn btn--default" size="middle" @click="handleCancelNewInvoice">{{ translations[language].cancel }}</a-button>
            <a-button
                class="btn btn--primary ml-4"
                html-type="submit"
                size="middle"
                :loading="loadingBtn"
                @click="handleSaveChangeDetailsInvoice"
                v-if="
              props.activePage === STCodeList.VALIDATED &&
              amountInvoiceNoFormat > 0 &&
              isClientAmountValidated
            "
            >{{ translations[language].generate }}</a-button>
          </a-col>
        </a-row>
      </a-col>
    </a-row>
    <!--Datatable invoice list-->
    <a-row v-if="props.activePage === 'CMP'" :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
      <a-col class="mt-8" span="24">
        <a-spin :spinning="loadingInvoiceMovement" size="large">
          <a-table
              class="w-full"
              :columns="columnsInvoiceList"
              :data-source="invoiceListMovement"
              :pagination="false"
              :scroll="{ x: 1200, y: 1000 }"
              bordered
          />
        </a-spin>
      </a-col>
    </a-row>
  </a-modal>
  <!--View invoice modal-->
  <a-modal
      v-model:open="isOpenModalViewPdf"
      v-if="isOpenModalViewPdf"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      width="1000px"
      :title="Invoice"
  >
    <div>
      <h1>Invoice</h1>
      <iframe
          v-if="pdfUrl"
          :src="pdfUrl"
          width="100%"
          height="600"
      ></iframe>
    </div>
  </a-modal>
  <!--Reject Modal-->
  <a-modal
      v-model:open="isOpenModalReject"
      v-if="isOpenModalReject"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      title="Reject movement"
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
          :rules="[{ required: true, message: 'Please input your observation!' }]"
      >
        <a-textarea v-model:value="formStateReject.observation" />
      </a-form-item>
      <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
        <a-col class="mt-8" span="24">
          <a-button class="btn btn--default" size="middle" @click="handleCloseModalReject">Cancel</a-button>
          <a-button
              class="btn btn--primary ml-4"
              html-type="submit"
              size="middle"
              :loading="loadingBtn"
          >Save</a-button>
        </a-col>
      </a-row>
    </a-form>
  </a-modal>
  <!--History validation Modal-->
  <a-modal
      v-model:open="isOpenModalHistoryValidation"
      v-if="isOpenModalHistoryValidation"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      width="1000px"
      :title="translations[language].ValidationHistory"
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