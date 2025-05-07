<script setup lang="ts">
import {createVNode, h} from 'vue';
import {
  AButton,
  AInputNumber, ATooltip,
  DeleteOutlined,
  ExclamationCircleOutlined,
  EyeOutlined, FilterOutlined,
  FormOutlined,
  PlusOutlined,
} from "#components";
import type {SelectValue} from "ant-design-vue/es/select";
import {handleInAuthorizedError} from "~/composables/CustomError";
import type {Paginate} from "~/composables/apiResponse.interface";
import type {FormInstance} from "ant-design-vue";
import {STCodeList, type TStatus} from "~/composables/Status.interface";
import type {IExpenseType} from "~/composables/settings/ExpenseType/ExpenseType.interface";
import {
  getAllExpenseTypeService,
} from "~/composables/settings/ExpenseType/expenseType.service";
import type {FormExpenses, IExpenses} from "~/composables/Expenses/Expenses.interface";
import {translations} from "~/composables/translations";
import {formatDateString} from "~/composables/helper";
import {
  deleteExpensesService,
  getAllExpensesService,
  insertOrUpdateExpenses
} from "~/composables/Expenses/expenses.service";
import type {SelectProps} from "ant-design-vue/lib";
import type {ICurrency} from "~/composables/settings/general/settings.interface";
import {getCurrencyService} from "~/composables/settings/general/settings.service";
import type {RangeValue} from "~/composables/dayJs.type";
import type {RuleObject} from "ant-design-vue/es/form";


  interface Props {
      activePage: TStatus;
  }

  const props = defineProps<Props>();

  //**************Beginning of state management**************
  //This is a global state for language of the app
  const language = useLanguage();
  const loading = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const loadingExpensesTypeInList = ref<boolean>(false);
  const keyword = ref<string>('');
  const pageSize = ref<number>(10);
  const currentPage = ref<number>(1);
  const totalPage = ref<number>(0);
  const data = ref<IExpenses[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isEdit = ref<boolean>(false);
  const isView = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const expensesId = ref<string>('');
  const currencyType = ref<string>('');
  const dateFilter = ref<RangeValue>();
  const formState = reactive<FormExpenses>(
      {
        idExpenseType: '',
        description:'',
        amount: 0,
      }
  );
  const optionsExpensesType = ref<SelectProps['options']>([{ value: '', label: translations[language.value].all}]);
  const optionsExpensesTypeInModal = ref<SelectProps['options']>([]);
  const currentExpensesTypeList = ref<string>('');
  //**************End of state management**************

  const activeActionsColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    customRender: ({ record }: { record: IExpenses }) => h('div', [
      h(ATooltip, { title: translations[language.value].consult, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleView(record)
        }, [h(EyeOutlined)]),
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
    customRender: ({ record }: { record: IExpenses }) => h('div', [
      h(ATooltip, { title: translations[language.value].consult, color: '#05c5c5' }, [
        h(AButton, {
          class: 'btn--info-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleView(record)
        }, [h(EyeOutlined)]),
      ]),
    ])
  };

  const columns = computed(() => {
    return [
      {
        title: 'Type',
        key: 'type',
        dataIndex: ['expenseType', 'designation'],
      },
      {
        title: 'Description',
        key: 'description',
        dataIndex: 'description',
        width: 200,
        customRender: ({record}: { record: IExpenses }) => h('div', [
          record.description && record.description !== '' ? record.description : '---'
        ]),
      },
      {
        title: translations[language.value].unitPrice,
        key: 'amount',
        dataIndex: 'amount',
        width: 170,
        customRender: ({record}: { record: IExpenses }) => {
          const value = new Intl.NumberFormat('en-US', {
            style: 'decimal',
            minimumFractionDigits: 2,
            maximumFractionDigits: 2,
          }).format(record.amount);

          return h('div', {style: {textAlign: 'right'}}, [`${value} ${currencyType.value}`]);
        }
      },
      {
        title: 'Date',
        key: 'createdAt',
        dataIndex: 'createdAt',
        width: 170,
        customRender: ({record}: { record: IExpenses }) => {
          const createdAt: string = formatDateString(record.createdAt, language.value, true);
          return h('div', {style: {textAlign: 'left'}}, [createdAt]);
        }
      },
      {
        title: h('div', {style: {textAlign: 'center'}}, [translations[language.value].status]),
        key: 'status',
        customRender: ({record}: { record: IExpenseType }) => h('div', [
          record.status.code === STCodeList.ACTIVE ?
              h('div',
                  {
                    style: {textAlign: 'center', color: 'white', borderRadius: '10px'},
                    class: 'primary-background-color'
                  },
                  [translations[language.value].active]
              )
              : h('div',
                  {
                    style: {textAlign: 'center', color: 'white', borderRadius: '10px'},
                    class: 'danger-background-color'
                  },
                  [translations[language.value].deleted]
              ),
        ])
      },
      props.activePage === STCodeList.ACTIVE ? activeActionsColumns : deletedActionColumns,
    ];
  });

  //***********Beginning of select method of category product***************
  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };

  const handleChangeFilterExpensesTypeInList = () => {
    getAllDataExpenses();
  };
  //***********End of select method of category product***************

  //**********Reset all value and validator form*******
  const resetForm = () => {
    if (formRef.value) {
      formRef.value.resetFields();
    }
  };

  //************Beginning of modal actions*********************
  const handleShowModal = (isEditMode: boolean, isViewMode: boolean) => {
    isEdit.value = isEditMode;
    isView.value = isViewMode;
    isOpenModal.value = true;
  }

  const handleCloseModal = () => {
    resetForm();
    isOpenModal.value = false;
  }

  const validatePrice = (rule: RuleObject, value: number, callback: any) => {
    if (value > 0) {
      callback();
    } else {
      callback(new Error(translations[language.value].amountGreaterError));
    }
  }
  //************End of modal actions*********************

  //************Add user button action*********
  const handleAddExpenseType = () => {
    resetForm();
    formState.idExpenseType = '';
    formState.description = '';
    formState.amount = 0;
    handleShowModal(false, false);
  }


  //************Beginning of actions datatable button method**********
  const handleView = (record: IExpenses) => {
    console.log(record.expenseType);
    resetForm();
    formState.idExpenseType = record.expenseType.uuid;
    formState.description = record.description;
    formState.amount = record.amount;

    handleShowModal(false, true);
  };

  const handleEdit = (record: IExpenses) => {
    resetForm();
    formState.idExpenseType = record.expenseType.uuid;
    formState.description = record.description;
    formState.amount = record.amount;
    expensesId.value = record.uuid;

    handleShowModal(true, false);
  };

  const handleDelete = (record: IExpenses) => {
    expensesId.value = record.uuid;

    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await deleteExpenses();
      }
    });
  };
  //************End of actions datatable button method**********

  //*******Global method on submit user form********************
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
          await updateExpenses();
        } else {
          await insertExpenses();
        }
      }
    });
  };

  //******************Beginning of CRUD controller**************
  const insertExpenses = async () => {
    const dataForm: FormExpenses = formState;

    try {
      //the params userId is null here because we are in the insert method
      await insertOrUpdateExpenses(dataForm, null, 'POST');
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
      await getAllDataExpenses();
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

  const updateExpenses = async () => {
    const dataForm: FormExpenses = formState;

    try {
      //Call operation API in service
      await insertOrUpdateExpenses(dataForm, expensesId.value, 'PATCH');
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
      await getAllDataExpenses();
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

  const deleteExpenses = async () => {

    try {
      //Call operation API in service
      await deleteExpensesService(expensesId.value);
      //turn off of loading button and close modal
      loadingBtn.value = false;
      isOpenModal.value = false;
      // Show success notification
      notification.success({
        message: translations['ENG'].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //reload data
      await getAllDataExpenses();
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

  const getAllDataExpenses = async () => {
    try {
      loading.value = true;
      let startDateStr: string = '';
      let endDateStr: string = '';

      if (dateFilter.value) {
        const [startDate, endDate] = dateFilter.value;
        startDateStr = startDate.format('YYYY-MM-DD');
        endDateStr = endDate.format('YYYY-MM-DD');
      }

      const response: Paginate<IExpenses[]> = await getAllExpensesService(
          pageSize.value,
          currentPage.value,
          currentExpensesTypeList.value,
          startDateStr,
          endDateStr,
          props.activePage);
      data.value = response.data;
      console.log(response.data);
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

  const getAllDataExpenseType = async () => {
    try {
      loadingExpensesTypeInList.value = true;
      const response: Paginate<IExpenseType[]> = await getAllExpenseTypeService(
          keyword.value,
          pageSize.value,
          currentPage.value,
          props.activePage);

      response.data.map((item: IExpenseType) => {
        if (optionsExpensesType.value) {
          optionsExpensesType.value.push({ value: item.uuid, label: item.designation });
        }

        if (optionsExpensesTypeInModal.value) {
          optionsExpensesTypeInModal.value.push({ value: item.uuid, label: item.designation });
        }
      });

      await nextTick(); // Ensure the DOM updates before proceeding
      loadingExpensesTypeInList.value = false;
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
    getAllDataExpenses();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllDataExpenses();
  };

  const handleFilterByDate = () => {
    getAllDataExpenses();
  }
  //******************End filter of and paginator methods****


  onMounted(() => {
    getCurrencyType();
    getAllDataExpenses();
    getAllDataExpenseType();
  })
</script>

<template>
  <!--Filter datatable-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
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
    <a-col class="mt-8" span="6">
      <a-button :icon="h(PlusOutlined)" @click="handleAddExpenseType" v-if="props.activePage === STCodeList.ACTIVE" class="btn--success ml-5">{{translations[language].add}}</a-button>
    </a-col>
    <!-- Sort by type -->
    <a-col class="mt-8" span="6">
      <span>Type : </span>
      <a-select
          class="w-44"
          v-model:value="currentExpensesTypeList"
          show-search
          :options="optionsExpensesType"
          :filter-option="filterOption"
          @change="handleChangeFilterExpensesTypeInList"
          :loading="loadingExpensesTypeInList"
      />
    </a-col>
    <!--Filter by date-->
    <a-col class="mt-8 flex justify-end" span="8">
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
            :columns="columns"
            :data-source="data"
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
          v-model:current="currentPage"
          v-model:pageSize="pageSize"
          :total="totalPage"
          @prevClick="handleClickPaginator"
          @change="handleClickPaginator"
          @nextClick="handleClickPaginator"
          :showSizeChanger="false" />
    </a-col>
  </a-row>
  <!--Expenses modal-->
  <a-modal
      v-model:open="isOpenModal"
      closable
      :footer="null"
      :title="translations[language].expenses"
      style="top: 20px"
      @ok=""
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
              name="idExpenseType"
              type="select"
              :rules="[{ required: true, message: translations[language].expensesTypeError }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="7"><label for="basic_idExpenseType"><span class="required_toil">*</span> {{ translations[language].expensesType }}:</label></a-col>
              <a-col span="17">
                <a-select
                    class="w-44"
                    size="large"
                    v-model:value="formState.idExpenseType"
                    show-search
                    :options="optionsExpensesTypeInModal"
                    :filter-option="filterOption"
                    :disabled="isView"
                    :loading="loadingExpensesTypeInList"
                    :placeholder="translations[language].selectExpensesType"
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
              <a-col span="7"><label for="basic_description">{{ translations[language].otherDescriptions }}:</label></a-col>
              <a-col span="17">
                <a-input v-model:value="formState.description" size="large" :placeholder="translations[language].otherDescriptions" :disabled="isView"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="amount"
              :rules="[
                      { required: true, message: translations[language].amountError },
                      { validator: validatePrice, trigger: 'change' }
                  ]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="7"><label for="basic_unitPrice"><span class="required_toil">*</span> {{ translations[language].amount }}:</label></a-col>
              <a-col span="17">
                <a-input-number class="w-full" v-model:value="formState.amount" :min="0" :disabled="isView">
                  <template #addonAfter>{{ currencyType }}</template>
                </a-input-number>
              </a-col>
            </a-row>
          </a-form-item>
          <a-row class="mt-10">
            <a-form-item class="w-full flex justify-start">
              <a-button class="btn btn--default" size="middle" @click="handleCloseModal">{{translations[language].cancel}}</a-button>
              <a-button
                  v-if="!isView"
                  class="btn btn--primary ml-4"
                  html-type="submit"
                  size="middle"
                  :loading="loading"
              >{{translations[language].save}}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
  </a-modal>
</template>

<style scoped>

</style>