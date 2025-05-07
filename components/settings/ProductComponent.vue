<script setup lang="ts">
import {createVNode, h} from 'vue';
import {
  AButton,
  AInputNumber, ATooltip,
  DeleteOutlined,
  DollarCircleOutlined,
  ExclamationCircleOutlined,
  EyeOutlined,
  FormOutlined,
  PlusOutlined,
  SearchOutlined,
} from "#components";
import type {SelectValue} from "ant-design-vue/es/select";
import {handleInAuthorizedError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import type {FormInstance} from "ant-design-vue";
import {STCodeList, type TStatus} from "~/composables/Status.interface";
import type {ICategory} from "~/composables/settings/Category/Category.interface";
import {getAllCategory} from "~/composables/settings/Category/category.service";
import type {FormProduct, IProduct} from "~/composables/settings/Product/Product.interface";
import type {FormProductSalesPrice, IProductSalesPrice} from "~/composables/settings/Product/ProductSalesPrice.interface";
import {
  deleteProductService, getAllDataProductSalesPriceService,
  getAllDataProductService, insertNewProductSalePrice,
  insertOrUpdateProduct,
} from "~/composables/settings/Product/product.service";
import type {SelectProps} from "ant-design-vue/lib";
import type {RuleObject} from "ant-design-vue/es/form";
import {formatDateString} from "~/composables/helper";
import type {IUnit} from "~/composables/settings/Unit/Unit.interface";
import {getAllUnit} from "~/composables/settings/Unit/unit.service";
import type {ICurrency} from "~/composables/settings/general/settings.interface";
import {getCurrencyService} from "~/composables/settings/general/settings.service";
import {translations} from "~/composables/translations";


interface Props {
    activePage: TStatus;
}


  const props = defineProps<Props>();

  //**************Beginning of state management**************
  //This is a global state for language of the app
  const language = useLanguage();
  const loading = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const loadingBtnSalesPrice = ref<boolean>(false);
  const loadingCategoryFilterList = ref<boolean>(false);
  const loadingUnitFilterList = ref<boolean>(false);
  const loadingSalesPrice = ref<boolean>(false);
  const keyword = ref<string>('');
  const pageSize = ref<number>(10);
  const currentPage = ref<number>(1);
  const totalPage = ref<number>(0);
  const pageSizeSalesPrice = ref<number>(10);
  const currentPageSalesPrice = ref<number>(1);
  const totalPageSalesPrice = ref<number>(0);
  const dataProduct = ref<IProduct[]>([]);
  const dataProductSalesPrice = ref<IProductSalesPrice[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isOpenModalSalesPrice = ref<boolean>(false);
  const isShowFormAddProductSalePrice = ref<boolean>(false);
  const isEdit = ref<boolean>(false);
  const isView = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const productId = ref<string>('');
  const currentProductDesignation = ref<string>('');
  const formState = reactive<FormProduct>(
      {
        designation: '',
        code: '',
        description: '',
        idCategory: '',
        idUnit: '',
      }
  );
  const formStateSalesPrice = reactive<FormProductSalesPrice>(
      {
        idProduct: '',
        unitPrice: 0,
        wholesale: 0,
        purchasePrice: 0,
      }
  );
  const optionsCategory = ref<SelectProps['options']>([{ value: '', label: translations[language.value].all}]);
  const currentCategoryList = ref<string>('');
  const optionsUnit = ref<SelectProps['options']>([{ value: '', label: translations[language.value].all}]);
  const currentUnitList = ref<string>('');
  const optionsCategoryInModal = ref<SelectProps['options']>([]);
  const currentCategoryInModal = ref<string>('');
  const optionsUnitInModal = ref<SelectProps['options']>([]);
  const currentUnitInModal = ref<string>('');
  const currencyType = ref<string>('');
  //**************End of state management**************

  //**************Beginning of Column datatable property***********

  const activeActionsColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    fixed: 'right',
    customRender: ({ record }: { record: IProduct }) => h('div', [
      h(ATooltip, { title: translations[language.value].consult, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleView(record)
        }, [h(EyeOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].manageProductPrices, color: '#e5b33e' }, [
        h(AButton, {
          class: 'btn--warning-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleShowProductSalesPrice(record)
        }, [h(DollarCircleOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].update, color: 'blue' }, [
        h(AButton, {
          class: 'btn--primary-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleEdit(record)
        }, [h(FormOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].delete, color: '#ff5959' }, [
        h(AButton, {
          class: 'btn--danger-outline btn-tab',
          size: 'middle',
          onClick: () => handleDelete(record)
        }, [h(DeleteOutlined)])
      ]),
    ])
  };

  const deletedActionColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    fixed: 'right',
    customRender: ({ record }: { record: IProduct }) => h('div', [
      h(ATooltip, { title: translations[language.value].consult, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleView(record)
        }, [h(EyeOutlined)]),
      ]),
      h(ATooltip, { title: translations[language.value].manageProductPrices, color: '#e5b33e' }, [
        h(AButton, {
          class: 'btn--warning-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleShowProductSalesPrice(record)
        }, [h(DollarCircleOutlined)]),
      ]),
    ])
  };

  const columns = computed<any>(() => [
    {
      title: translations[language.value].designation,
      dataIndex: 'designation',
      key: 'designation',
      width: 170,
      fixed: 'left',
    },
    {
      title: 'Code',
      dataIndex: 'code',
      key: 'code',
      width: 170,
      customRender: ({ text }: { text: string }) => text ? text : '---'
    },
    {
      title: translations[language.value].unit,
      dataIndex: ['unit', 'designation'],
      key: 'unit',
      width: 100,
      customRender: ({ text }: { text: string }) => text ? text : '---'
    },
    {
      title: translations[language.value].category,
      dataIndex: ['category', 'designation'],
      key: 'category',
      width: 100,
      customRender: ({ text }: { text: string }) => text ? text : '---'
    },
    {
      title: translations[language.value].unitPrice,
      key: 'unitPrice',
      dataIndex: ['productSalesPrice', 'unitPrice'],
      width: 170,
      customRender: ({ record }: { record: IProduct}) => {
        let value = '0.00';

        if (record.productSalesPrice.length > 0) {
          record.productSalesPrice.map((item: IProductSalesPrice) => {
            if (item.status.code === STCodeList.ACTIVE) {
              value = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.unitPrice);
            }
          })
        }

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: translations[language.value].wholesalePrice,
      key: 'wholesalePrice',
      dataIndex: ['productSalesPrice', 'wholesale'],
      width: 170,
      customRender: ({ record }: { record: IProduct}) => {
        let value = '0.00';

        if (record.productSalesPrice.length > 0) {
          record.productSalesPrice.map((item: IProductSalesPrice) => {
            if (item.status.code === STCodeList.ACTIVE) {
              value = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.wholesale);
            }
          })
        }

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: translations[language.value].purchasePrice,
      key: 'purchasePrice',
      dataIndex: ['productSalesPrice', 'purchasePrice'],
      width: 170,
      customRender: ({ record }: { record: IProduct}) => {
        let value = '0.00';

        if (record.productSalesPrice.length > 0) {
          record.productSalesPrice.map((item: IProductSalesPrice) => {
            if (item.status.code === STCodeList.ACTIVE) {
              value = new Intl.NumberFormat('en-US', {
                style: 'decimal',
                minimumFractionDigits: 2,
                maximumFractionDigits: 2,
              }).format(item.purchasePrice);
            }
          })
        }

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      }
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      dataIndex: 'status',
      width: 120,
      customRender: ({ record }: { record: ICategory}) => h('div', [
        record.status.code === STCodeList.ACTIVE ?
            h('div',
                {
                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                  class: 'primary-background-color'
                },
                [translations[language.value].active]
            )
            : (record.status.code === STCodeList.DELETED ? h('div',
                        {
                          style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                          class: 'danger-background-color'
                        },
                        [translations[language.value].deleted]
                    ):
                    h('div',
                        {
                          style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                          class: 'secondary-background-color'
                        },
                        [translations[language.value].old]
                    )
            ),
      ])
    },
    props.activePage === STCodeList.ACTIVE ?  activeActionsColumns : deletedActionColumns,
  ]);

  //Columns for product sales price datatable
  const columnsSalesPrice = computed<any>(() => [

    {
      title: translations[language.value].unitPrice,
      key: 'unitPrice',
      dataIndex: 'unitPrice',
      width: 200,
      customRender: ({ record }: { record: IProductSalesPrice}) => {
        let value = '0.00';
        value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.unitPrice);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      },
    },
    {
      title: translations[language.value].wholesalePrice,
      key: 'wholesale',
      dataIndex: 'wholesale',
      width: 200,
      customRender: ({ record }: { record: IProductSalesPrice}) => {
        let value = '0.00';
        value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.wholesale);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      },
    },
    {
      title: translations[language.value].purchasePrice,
      key: 'purchasePrice',
      dataIndex: 'purchasePrice',
      width: 200,
      customRender: ({ record }: { record: IProductSalesPrice}) => {
        let value = '0.00';
        value = new Intl.NumberFormat('en-US', {
          style: 'decimal',
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
        }).format(record.purchasePrice);

        return h('div', { style: { textAlign: 'right' } }, [`${value} ${currencyType.value}`]);
      },
    },
    {
      title: 'Date',
      key: 'createdAt',
      dataIndex: 'createdAt',
      customRender: ({ record }: { record: IProductSalesPrice}) => {
        const createdAd: string = formatDateString(record.createdAt, language.value, false);
        return h('div', {style: {textAlign: 'right'}}, [createdAd]);
      }
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      dataIndex: 'status',
      customRender: ({ record }: { record: ICategory}) => h('div', [
        record.status.code === STCodeList.ACTIVE ?
            h('div',
                {
                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                  class: 'primary-background-color'
                },
                [translations[language.value].active]
            )
            : (record.status.code === STCodeList.DELETED ? h('div',
                        {
                          style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                          class: 'danger-background-color'
                        },
                        [translations[language.value].deleted]
                    ):
                    h('div',
                        {
                          style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                          class: 'secondary-background-color'
                        },
                        [translations[language.value].old]
                    )
            ),
      ])
    },
    // {
    //   title: 'Actions',
    //   key: 'actions',
    //   width: 80,
    //   fixed: 'right',
    //   customRender: ({ record }: { record: IProductSalesPrice }) => h('div', [
    //     h(AButton, {
    //       disabled: record.status.code === STCodeList.OLD,
    //       class: 'btn--primary-outline',
    //       size: 'middle',
    //       style: { marginRight: '8px' },
    //       onClick: () => handleUpdateProductSalesPrice(record)
    //     }, [h(SaveOutlined)]),
    //   ])
    // }
  ]);
  //**************End of Column datatable property***********

  //***********Beginning of select method of category product***************
  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };

  const handleChangeFilterCategoryInList = () => {
    getAllDataProduct();
  };

  const handleChangeFilterUnitInList = () => {
    getAllDataProduct();
  };
  //***********End of select method of category product***************

  //**********Reset all value and validator form*******
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  };

  //************Beginning of modal actions*********************
  //************Beginning of modal add, view, edit actions*********************
  const handleShowModal = (isEditMode: boolean, isViewMode: boolean) => {
    isEdit.value = isEditMode;
    isView.value = isViewMode;
    isOpenModal.value = true;
  }

  const handleCloseModal = () => {
    resetForm();
    isOpenModal.value = false;
  }
  //************End of modal add, view, edit actions*********************

  //************Beginning of sales price modal actions*********************
  const handleShowModalProductSalesPrice = () => {
    isOpenModalSalesPrice.value = true;
  }

  const handleCloseModalSalesPrice = () => {
    isOpenModalSalesPrice.value = false;
  }
  //************End of sales price modal actions*********************

  //*************Beginning of product sales price form methods**********
  const handleShowFormAddProductSalesPrice = () => {
    //Rest validator and value of sales price form
    resetForm();
    formStateSalesPrice.unitPrice = 0;
    formStateSalesPrice.wholesale = 0;
    formStateSalesPrice.purchasePrice = 0;

    isShowFormAddProductSalePrice.value = true;
  }

  const handleCancelAddProductSalesPrice = () => {
    isShowFormAddProductSalePrice.value = false;
  }

  const validatePrice = (rule: RuleObject, value: number, callback: any) => {
    if (value > 0) {
      callback();
    } else {
      callback(new Error(translations[language.value].priceErrorGreater));
    }
  }
  //*************Beginning of product sales price form methods**********
  //************End of modal actions*********************

  //************Add user button action*********
  const handleAdd = () => {
    //Reset validator and value of form before show modal
    resetForm();
    formState.designation = '';
    formState.code = '';
    formState.description = '';
    formState.idCategory = '';
    formState.idUnit = '';
    currentUnitInModal.value = '';
    currentCategoryInModal.value = '';
    handleShowModal(false, false);
  }


  //************Beginning of actions datatable button method**********
  const handleView = (record: IProduct) => {
    resetForm();
    formState.designation = record.designation;
    formState.code = record.code ? record.code : '';
    formState.description = record.description;
    formState.idCategory = record.category.uuid;
    formState.idUnit = record.unit.uuid;
    currentUnitInModal.value = record.unit.uuid;
    currentCategoryInModal.value = record.category.uuid;

    handleShowModal(false, true);
  };

  const handleShowProductSalesPrice = (record: IProduct) => {
    //Reset validator
    resetForm();
    //Set current idProduct
    formStateSalesPrice.idProduct = record.uuid;
    //Set current designation product
    currentProductDesignation.value = record.designation;
    //Reset value of form product sales price
    formStateSalesPrice.unitPrice = 0;
    formStateSalesPrice.wholesale = 0;
    formStateSalesPrice.purchasePrice = 0;

    //Get All data product sales price
    getAllDataProductSalesPrice();

    handleShowModalProductSalesPrice();
  };

  const handleEdit = (record: IProduct) => {
    //Reset validator
    resetForm();
    //Set value formState with current index of product
    formState.designation = record.designation;
    formState.code = record.code ? record.code : '';
    formState.description = record.description;
    formState.idCategory = record.category.uuid;
    formState.idUnit = record.unit.uuid;
    productId.value = record.uuid;
    currentUnitInModal.value = record.unit.uuid;
    currentCategoryInModal.value = record.category.uuid;

    handleShowModal(true, false);
  };

  const handleDelete = (record: IProduct) => {
    //Set productId with current record
    productId.value = record.uuid;
    //Show confirm popup
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await deleteProduct();
      }
    });
  };
  //************End of actions datatable button method**********

  //*******Global method on submit product form********************
  const onSubmitForm = async () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;

        if (isEdit.value) {
          await updateProduct();
        } else {
          await insertProduct();
        }
      }
    });
  };

//*******Method on submit product sales price form********************
  const onSubmitFormProductSalesPrice = async () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtnSalesPrice.value = true;
        await insertProductSalesPrice();
      }
    });
  };

  // const handleUpdateProductSalesPrice = async (productSalesPrice: IProductSalesPrice) => {
  //   Modal.confirm({
  //     title: translations[language.value].confirmationTitle,
  //     icon: createVNode(ExclamationCircleOutlined),
  //     content: translations[language.value].confirmationDescription,
  //     okText: translations[language.value].yes,
  //     cancelText: translations[language.value].no,
  //     onOk: async () => {
  //       await updateProductSalesPrice(productSalesPrice);
  //     }
  //   });
  // };
  //******************Beginning of CRUD controller**************
  const insertProduct = async () => {
    const dataForm: FormProduct = formState;

    try {
      //the params userId is null here because we are in the insert method
      await insertOrUpdateProduct(dataForm, null, 'POST');
      //turn off of loading button and close modal
      loadingBtn.value = false;
      isOpenModal.value = false;

      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //reload data
      await getAllDataProduct();
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

  const insertProductSalesPrice = async () => {
    const dataForm: FormProductSalesPrice = formStateSalesPrice;

    try {
      //the params userId is null here because we are in the insert method
      await insertNewProductSalePrice(dataForm);
      //turn off of loading button and close modal
      loadingBtnSalesPrice.value = false;

      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //Close form add product sales price
      handleCancelAddProductSalesPrice();
      //reload data product sales price
      await getAllDataProductSalesPrice();
      //reload data product
      await getAllDataProduct();
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

  const updateProduct = async () => {
    const dataForm: FormProduct = formState;

    try {
      //Call operation API in service
      await insertOrUpdateProduct(dataForm, productId.value, 'PATCH');
      //turn off of loading button and close modal
      loadingBtn.value = false;
      isOpenModal.value = false;
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //reload data
      await getAllDataProduct();
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

  const deleteProduct = async () => {

    try {
      //Call operation API in service
      await deleteProductService(productId.value);
      //turn off of loading button and close modal
      loadingBtn.value = false;
      isOpenModal.value = false;
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //reload data
      await getAllDataProduct();
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

  const getAllDataProduct = async () => {
    try {
      loading.value = true;
      const response: Paginate<IProduct[]> = await getAllDataProductService(
          keyword.value,
          pageSize.value,
          currentPage.value,
          props.activePage,
          currentCategoryList.value,
          currentUnitList.value
      );
      dataProduct.value = response.data;
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
        message: 'Error',
        description: (error as Error).message,
        class: 'custom-error-notification'
      });
    }
  }

  const getAllDataProductSalesPrice = async () => {
    try {
      loadingSalesPrice.value = true;
      const response: Paginate<IProductSalesPrice[]> = await getAllDataProductSalesPriceService(
          pageSizeSalesPrice.value,
          currentPageSalesPrice.value,
          formStateSalesPrice.idProduct
      );
      dataProductSalesPrice.value = response.data;
      totalPageSalesPrice.value = response.totalRows;
      loadingSalesPrice.value = false;
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
        message: 'Error',
        description: (error as Error).message,
        class: 'custom-error-notification'
      });
      loadingSalesPrice.value = true;
    }
  }

  // const updateProductSalesPrice = async (productSalesPrice: IProductSalesPrice) => {
  //   try {
  //     loadingSalesPrice.value = true;
  //
  //     await updateProductSalesPriceService(productSalesPrice);
  //     await getAllDataProductSalesPrice();
  //   } catch (error) {
  //     //Verification code status if equal 401 then we redirect to log in
  //     if (error instanceof CustomError) {
  //       if (error.status === 401) {
  //         //call the global handle action if in authorized
  //         handleInAuthorizedError(error);
  //         return;
  //       }
  //     }
  //
  //     // Show error notification
  //     notification.error({
  //       message: 'Error',
  //       description: (error as Error).message,
  //       class: 'custom-error-notification'
  //     });
  //     loadingSalesPrice.value = false;
  //   }
  // }

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

          if (optionsCategoryInModal.value) {
            optionsCategoryInModal.value.push({ value: item.uuid, label: item.designation });
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
        message: 'Error',
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
        if (optionsUnitInModal.value) {
          optionsUnitInModal.value.push({ value: item.uuid, label: item.designation });
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
        message: 'Error',
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
  //******************End of CRUD controller********************

  //******************Beginning of filter and paginator methods****
  const handleClickPaginator = () => {
    getAllDataProduct();
  };

  const handleClickPaginatorSalesPrice = () => {
    getAllDataProductSalesPrice();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllDataProduct();
  };

  const handleSearch = () => {
    currentPage.value = 1;
    getAllDataProduct();
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
    getCurrencyType();
    getAllDataProduct();
    getAllDataCategory();
    getAllDataUnit();
  })
</script>

<template>
  <!-- Sort page, add btn, sort by category, search -->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <!-- Page size -->
    <a-col class="mt-8" span="4">
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
    <!-- Add btn -->
    <a-col class="mt-8" span="3">
      <a-button :icon="h(PlusOutlined)" @click="handleAdd" v-if="props.activePage === STCodeList.ACTIVE" class="btn--success ml-5">{{ translations[language].add }}</a-button>
    </a-col>
    <!-- Sort by category -->
    <a-col class="mt-8" span="6">
      <span>Category : </span>
      <a-select
          class="w-44"
          v-model:value="currentCategoryList"
          show-search
          :options="optionsCategory"
          :filter-option="filterOption"
          @change="handleChangeFilterCategoryInList"
          :loading="loadingCategoryFilterList"
          :placeholder="translations[language].selectCategory"
      />
    </a-col>
    <!-- Sort by unit -->
    <a-col class="mt-8" span="6">
      <span>Unit : </span>
      <a-select
          class="w-44"
          v-model:value="currentUnitList"
          show-search
          :options="optionsUnit"
          :filter-option="filterOption"
          @change="handleChangeFilterUnitInList"
          :loading="loadingUnitFilterList"
          :placeholder="translations[language].selectUnit"
      />
    </a-col>
    <!-- Search input -->
    <a-col class="mt-8 flex justify-end" span="5">
      <a-input type="text" class="w-48 h-9" v-model:value="keyword" :placeholder="translations[language].search"/>&nbsp;
      <a-button class="btn--primary" :icon="h(SearchOutlined)" @click="handleSearch"/>
    </a-col>
  </a-row>
  <!-- Datatable -->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <a-col class="mt-8" span="24">
      <a-spin :spinning="loading" size="large">
        <a-table
            class="w-full"
            :columns="columns"
            :data-source="dataProduct"
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
  <!-- Modal for add, view or edit -->
  <a-modal
      v-model:open="isOpenModal"
      closable
      :footer="null"
      :title="translations[language].product"
      style="top: 20px"
      @ok=""
      v-if="isOpenModal"
  >
    <a-row class="w-full">
      <a-col class="w-full">
        <a-form
            ref="formRef"
            :model="formState"
            name="basic"
            layout="inline"
            autocomplete="off"
            @finish="onSubmitForm"
        >
          <a-form-item
              name="designation"
              type="text"
              :rules="[{ required: true, message: translations[language].errorDesignation }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="5"><label for="basic_designation"><span class="required_toil">*</span> {{ translations[language].designation }}:</label></a-col>
              <a-col span="19">
                <a-input v-model:value="formState.designation" size="large" :placeholder="translations[language].designation" :disabled="isView"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="code"
              type="text"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="5"><label for="basic_code">Code:</label></a-col>
              <a-col span="19">
                <a-input v-model:value="formState.code" size="large" :placeholder="Code" :disabled="isView"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="idUnit"
              type="select"
              :rules="[{ required: true, message: translations[language].errorUnit }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="5"><label for="basic_idUnit"><span class="required_toil">*</span> {{ translations[language].unit }}:</label></a-col>
              <a-col span="19">
                <a-select
                    class="w-44"
                    v-model:value="currentUnitInModal"
                    show-search
                    :options="optionsUnitInModal"
                    :filter-option="filterOption"
                    :disabled="isView"
                    :loading="loadingUnitFilterList"
                    :placeholder="translations[language].selectUnit"
                    @change="(value) => formState.idUnit = value as string"
                ></a-select>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="idCategory"
              type="select"
              :rules="[{ required: true, message: translations[language].errorCategory }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="5"><label for="basic_idCategory"><span class="required_toil">*</span> {{ translations[language].category }}:</label></a-col>
              <a-col span="19">
                <a-select
                    class="w-44"
                    v-model:value="currentCategoryInModal"
                    show-search
                    :options="optionsCategoryInModal"
                    :filter-option="filterOption"
                    :disabled="isView"
                    :loading="loadingCategoryFilterList"
                    :placeholder="translations[language].selectCategory"
                    @change="(value) => formState.idCategory = value as string"
                ></a-select>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="description"
              type="text"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="24">
                <a-textarea v-model:value="formState.description" :placeholder="translations[language].descriptionPlaceholder" allow-clear :disabled="isView"/>
              </a-col>
            </a-row>
          </a-form-item>
          <a-row class="mt-10">
            <a-form-item class="w-full flex justify-start">
              <a-button class="btn btn--default" size="middle" @click="handleCloseModal">{{ translations[language].cancel }}</a-button>
              <a-button
                  v-if="!isView"
                  class="btn btn--primary ml-4"
                  html-type="submit"
                  size="middle"
                  :loading="loading"
              >{{ translations[language].save }}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
  </a-modal>
  <!-- Modal for product sales prices -->
  <a-modal
      v-model:open="isOpenModalSalesPrice"
      closable
      :footer="null"
      style="top: 20px"
      @ok=""
      v-if="isOpenModalSalesPrice"
      width="1000px"
  >
    <!-- Template title modal -->
    <template #title>
      <span>{{ translations[language].pricesOf }} : {{ currentProductDesignation }}</span>
      <a-tooltip :title="translations[language].addNewProductPrices" :color="'#38c172'">
        <a-button
            v-if="props.activePage === STCodeList.ACTIVE"
            class="btn--success ml-4"
            :icon="h(PlusOutlined)"
            @click="handleShowFormAddProductSalesPrice"
            size="middle"
        >
        </a-button>
      </a-tooltip>
    </template>
    <!-- Form to add a new product sales price -->
    <a-row v-if="isShowFormAddProductSalePrice" class="w-full">
      <a-col class="w-full">
        <a-form
            ref="formRef"
            :model="formStateSalesPrice"
            name="basic"
            layout="inline"
            autocomplete="off"
            @finish="onSubmitFormProductSalesPrice"
        >
          <!-- Form items -->
          <a-row>
            <a-col span="7">
              <a-form-item
                  name="unitPrice"
                  :rules="[
                      { required: true, message: translations[language].unitPriceError },
                      { validator: validatePrice, trigger: 'change' }
                  ]"
                  class="w-full mt-10"
              >
                <a-row>
                  <a-col span="24"><label for="basic_unitPrice"><span class="required_toil">*</span> {{ translations[language].unitPrice }}:</label></a-col>
                  <a-col span="24">
                    <a-input-number v-model:value="formStateSalesPrice.unitPrice" :min="0">
                      <template #addonAfter>{{ currencyType }}</template>
                    </a-input-number>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col span="7">
              <a-form-item
                  name="wholesale"
                  class="w-full mt-10"
              >
                <a-row>
                  <a-col span="24"><label for="basic_wholesale"><span class="required_toil"></span> {{ translations[language].wholesalePrice }}:</label></a-col>
                  <a-col span="24">
                    <a-input-number v-model:value="formStateSalesPrice.wholesale" :min="0">
                      <template #addonAfter>{{ currencyType }}</template>
                    </a-input-number>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
            <a-col span="7">
              <a-form-item
                  name="purchasePrice"
                  type="text"
                  :rules="[
                      { required: true, message: translations[language].purchasePriceError },
                      { validator: validatePrice, trigger: 'change' }
                  ]"
                  class="w-full mt-10"
              >
                <a-row>
                  <a-col span="24"><label for="basic_purchasePrice"><span class="required_toil">*</span> {{ translations[language].purchasePrice }}:</label></a-col>
                  <a-col span="24">
                    <a-input-number v-model:value="formStateSalesPrice.purchasePrice" :min="0">
                      <template #addonAfter>{{ currencyType }}</template>
                    </a-input-number>
                  </a-col>
                </a-row>
              </a-form-item>
            </a-col>
          </a-row>
          <!-- Form actions btn -->
          <a-row class="mt-10">
            <a-form-item class="w-full flex justify-start">
              <a-button class="btn btn--default" size="middle" @click="handleCancelAddProductSalesPrice">{{ translations[language].cancel }}</a-button>
              <a-button
                  v-if="!isView"
                  class="btn btn--primary ml-4"
                  html-type="submit"
                  size="middle"
                  :loading="loadingBtnSalesPrice"
              >{{ translations[language].save }}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
    <!-- Datatable product sales price -->
    <a-row class="mt-8">
      <a-col span="24">
        <a-spin :spinning="loadingSalesPrice" size="large">
          <a-table
              :columns="columnsSalesPrice"
              :data-source="dataProductSalesPrice"
              :pagination="false"
              :scroll="{ x: 900, y: 1000 }"
              bordered
          />
        </a-spin>
      </a-col>
    </a-row>
    <!-- Pagination -->
    <a-row>
      <a-col class="mt-8 flex justify-end" span="24">
        <a-pagination
            v-model:current="currentPageSalesPrice"
            v-model:pageSize="pageSizeSalesPrice"
            :total="totalPageSalesPrice"
            @prevClick="handleClickPaginatorSalesPrice"
            @change="handleClickPaginatorSalesPrice"
            @nextClick="handleClickPaginatorSalesPrice"
            :showSizeChanger="true"
        />
      </a-col>
    </a-row>
    <!-- Btn close modal -->
    <a-row class="mt-10">
      <a-col span="24">
        <a-button class="btn btn--secondary-outline w-full" size="middle" @click="handleCloseModalSalesPrice">{{ translations[language].close }}</a-button>
      </a-col>
    </a-row>
  </a-modal>
</template>

<style scoped>

</style>