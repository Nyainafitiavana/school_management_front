<script setup lang="ts">
import {createVNode, h} from 'vue';
import {
  AButton,
  ATooltip,
  DeleteOutlined,
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
import type {FormSubject, ISubject} from "~/composables/Subject/Subject.interface";
import {translations} from "~/composables/translations";
import {deleteSubjectService, getAllSubject, insertOrUpdateSubject} from "~/composables/Subject/subject.service";


interface Props {
      activePage: TStatus;
    }

  //This is a global state for language of the app
  const language = useLanguage();
  const loading = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const keyword = ref<string>('');
  const pageSize = ref<number>(10);
  const currentPage = ref<number>(1);
  const totalPage = ref<number>(0);
  const data = ref<ISubject[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isEdit = ref<boolean>(false);
  const isView = ref<boolean>(false);
  const formRef = ref<FormInstance>();
  const subjectId = ref<string>('');
  const formState = reactive<FormSubject>({designation: ''});

  const props = defineProps<Props>();

  const activeActionsColumns = {
    title: 'Actions',
    key: 'actions',
    width: 150,
    customRender: ({ record }: { record: ISubject }) => h('div', [
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
    width: 90,
    customRender: ({ record }: { record: ISubject }) => h('div', [
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

  const columns = computed(() => [
    {
      title: translations[language.value].designation,
      dataIndex: 'designation',
      key: 'designation',
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      customRender: ({ record }: { record: ISubject}) => h('div', [
        record.status.code === STCodeList.ACTIVE ?
            h('div',
                {
                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                  class: 'primary-background-color'
                },
                [translations[language.value].active]
            )
            : h('div',
                {
                  style: { textAlign: 'center', color: 'white', borderRadius: '10px' },
                  class: 'danger-background-color'
                },
                [translations[language.value].deleted]
            ),
      ])
    },
    props.activePage === STCodeList.ACTIVE ?  activeActionsColumns : deletedActionColumns,
  ]);

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
  //************End of modal actions*********************

  //************Add user button action*********
  const handleAdd = () => {
    resetForm();
    formState.designation = '';
    handleShowModal(false, false);
  }


  //************Beginning of actions datatable button method**********
  const handleView = (record: ISubject) => {
    resetForm();
    formState.designation = record.designation;

    handleShowModal(false, true);
  };

  const handleEdit = (record: ISubject) => {
    resetForm();
    formState.designation = record.designation;

    if (record.uuid != null) {
      subjectId.value = record.uuid;
    }

    handleShowModal(true, false);
  };

  const handleDelete = (record: ISubject) => {
    if (record.uuid != null) {
      subjectId.value = record.uuid;
    }

    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await deleteSubject();
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
          await updateSubject();
        } else {
          await insertSubject();
        }
      }
    });
  };

  //******************Beginning of CRUD controller**************
  const insertSubject = async () => {
    try {
      //the params userId is null here because we are in the insert method
      await insertOrUpdateSubject(formState, null, 'POST');
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
      await getAllDataSubject();
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

  const updateSubject = async () => {
    const dataForm: FormSubject = {
      designation: formState.designation,
    };

    try {
      //Call operation API in service
      await insertOrUpdateSubject(dataForm, subjectId.value, 'PATCH');
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
      await getAllDataSubject();
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

  const deleteSubject = async () => {

    try {
      //Call operation API in service
      await deleteSubjectService(subjectId.value);
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
      await getAllDataSubject();
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

  const getAllDataSubject = async () => {
    try {
      loading.value = true;
      const response: Paginate<ISubject[]> = await getAllSubject(
          keyword.value,
          pageSize.value,
          currentPage.value,
          props.activePage);
      data.value = response.data;
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
  //******************End of CRUD controller********************

  //******************Beginning of filter and paginator methods****
  const handleClickPaginator = () => {
    getAllDataSubject();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllDataSubject();
  };

  const handleSearch = () => {
    currentPage.value = 1;
    getAllDataSubject();
  }
  //******************End filter of and paginator methods****


  onMounted(() => {
    getAllDataSubject();
  })
</script>

<template>
  <!--Filter datatable-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
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
    <a-col class="mt-8" span="7">
      <a-button :icon="h(PlusOutlined)" @click="handleAdd" v-if="props.activePage === STCodeList.ACTIVE" class="btn--success ml-5">{{translations[language].add}}</a-button>
    </a-col>
    <a-col class="mt-8 flex justify-end" span="12">
      <a-input type="text" class="w-56 h-9" v-model:value="keyword" />&nbsp;
      <a-button class="btn--primary" :icon="h(SearchOutlined)" @click="handleSearch"/>
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
            :scroll="{ x: 1000, y: 480 }"
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
  <!--Subject modal-->
  <a-modal
      v-model:open="isOpenModal"
      closable
      :footer="null"
      title="Matière"
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
              name="designation"
              type="text"
              :rules="[{ required: true, message: translations[language].errorDesignation }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="5"><label for="basic_designation"><span class="required_toil">*</span> {{translations[language].designation}}:</label></a-col>
              <a-col span="19">
                <a-input v-model:value="formState.designation" size="large" :placeholder="translations[language].designation" :disabled="isView"></a-input>
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