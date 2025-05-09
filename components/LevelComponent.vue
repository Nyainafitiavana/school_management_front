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
  import {translations} from "~/composables/translations";
  import type {FormLevel, FormSubjectLevel, ILevel, ISubjectLevel} from "~/composables/Level/level.interface";
  import {
    deleteLevelService,
    getAllLevel, getAllSubjectLevel,
    insertOrUpdateLevel,
    insertOrUpdateSubjectLevel
  } from "~/composables/Level/level.service";
  import type {SelectProps} from "ant-design-vue/lib";
  import type {IUser} from "~/composables/User/User.interface";
  import {getAllUser} from "~/composables/User/user.service";
  import {BookOutlined} from "@ant-design/icons-vue";
  import type {ISubject} from "~/composables/Subject/Subject.interface";
  import {getAllSubject} from "~/composables/Subject/subject.service";


  interface Props {
    activePage: TStatus;
  }
  const props = defineProps<Props>();
  //This is a global state for language of the app
  const language = useLanguage();
  const loading = ref<boolean>(false);
  const loadingBtn = ref<boolean>(false);
  const keyword = ref<string>('');
  const pageSize = ref<number>(10);
  const currentPage = ref<number>(1);
  const totalPage = ref<number>(0);
  const data = ref<ILevel[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isOpenModalSubject = ref<boolean>(false);
  const isEdit = ref<boolean>(false);
  const isView = ref<boolean>(false);
  const formRefLevel = ref<FormInstance>();
  const formRefSubjectLevel = ref<FormInstance>();
  const levelId = ref<string>('');
  const formState = reactive<FormLevel>({designation: '', teacherInChargeId: null,});
  const formStateSubjectLevel = reactive<FormSubjectLevel>({subjectId: '', teacherId: null, coefficient: null});
  const optionsTeacher = ref<SelectProps['options']>([]);
  const optionsSubject = ref<SelectProps['options']>([]);
  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };
  const activeKey = ref<string>('1');
  const keywordSubjectLevel = ref<string>('');
  const pageSizeSubjectLevel = ref<number>(10);
  const currentPageSubjectLevel = ref<number>(1);
  const totalPageSubjectLevel = ref<number>(0);
  const dataSubjectLevel = ref<ISubjectLevel[]>([]);
  const subjectLevelId = ref<string>('');
  const loadingSubjectLevel = ref<boolean>(false);
  //*********Begining of datatables column***************
  const activeActionsColumns = {
    title: 'Actions',
    key: 'actions',
    width: 200,
    customRender: ({ record }: { record: ILevel }) => h('div', [
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
      h(ATooltip, { title: 'Matièrs par niveau', color: 'blue' }, [
        h(AButton, {
          class: 'btn--warning-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleShowSubjectLevel(record)
        }, [h(BookOutlined)]),
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
    customRender: ({ record }: { record: ILevel }) => h('div', [
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
      width: 150,
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, ['Enseignant(e) responsable']),
      key: 'teacher',
      customRender: ({ record }: { record: ILevel}) => h('div', [
          h('div',
              [`${record.user ? record.user.lastName : ''} ${record.user && record.user.firstName ? record.user.firstName : ''}`]
          ),
      ])
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      customRender: ({ record }: { record: ILevel}) => h('div', [
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

  const columnsSubjectLevel = computed(() => [
    {
      title: h('div', { style: { textAlign: 'center' } }, ['Matière']),
      key: 'subject',
      customRender: ({ record }: { record: ISubjectLevel}) => h('div', [
        h('div',
            [`${record.subjects ? record.subjects.designation : ''}`]
        ),
      ])
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, ['Enseignant(e)']),
      key: 'teacher',
      customRender: ({ record }: { record: ISubjectLevel}) => h('div', [
        h('div',
            [`${record.users ? record.users.lastName : ''} ${record.users && record.users.firstName ? record.users.firstName : ''}`]
        ),
      ])
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      customRender: ({ record }: { record: ISubjectLevel}) => h('div', [
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
    activeKey.value === '1' ? {
      title: 'Actions',
      key: 'actions',
      width: 200,
      customRender: ({ record }: { record: ISubjectLevel }) => h('div', [
        h(ATooltip, { title: translations[language.value].update, color: 'blue' }, [
          h(AButton, {
            class: 'btn--primary-outline btn-tab',
            size: 'middle',
            style: { marginRight: '8px' },
            onClick: () => handleEditSubjectLevel(record)
          }, [h(FormOutlined)]),
        ]),
        h(ATooltip, { title: translations[language.value].delete, color: '#ff5959' }, [
          h(AButton, {
            class: 'btn--danger-outline btn-tab',
            size: 'middle',
            onClick: () => handleDeleteSubjectLevel(record)
          }, [h(DeleteOutlined)])
        ]),
      ])
    } : {
      title: 'Actions',
      key: 'actions',
      width: 200,
    }
  ]);
  //*********End of datatables column***************

  //**********Reset all value and validator form*******
  const resetForm = () => {
    if (formRefLevel.value) {
      formRefLevel.value.resetFields();
    }

    if (formRefSubjectLevel.value) {
      formRefSubjectLevel.value.resetFields();
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

  const handleShowModalSubject = (isEditMode: boolean, isViewMode: boolean) => {
    isEdit.value = isEditMode;
    isView.value = isViewMode;
    isOpenModalSubject.value = true;
    pageSizeSubjectLevel.value = 10;
    currentPageSubjectLevel.value = 1;
    keywordSubjectLevel.value = '';
    getAllDataSubjectLevel();
  }
  //************End of modal actions*********************

  //************Add button action*********
  const handleAdd = () => {
    resetForm();
    formState.designation = '';
    formState.teacherInChargeId = '';
    handleShowModal(false, false);
  }


  //************Beginning of actions datatable button method**********
  const handleView = (record: ILevel) => {
    resetForm();
    formState.designation = record.designation;
    formState.teacherInChargeId = record.user ? record.user.uuid : null;

    handleShowModal(false, true);
  };

  const handleEdit = (record: ILevel) => {
    resetForm();
    formState.designation = record.designation;
    formState.teacherInChargeId = record.user ? record.user.uuid : null;

    if (record.uuid != null) {
      levelId.value = record.uuid;
    }

    handleShowModal(true, false);
  };

  const handleDelete = (record: ILevel) => {
    if (record.uuid != null) {
      levelId.value = record.uuid;
    }

    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await deleteLevel();
      }
    });
  };

  const handleShowSubjectLevel = (record: ILevel) => {
    if (record.uuid != null) {
      levelId.value = record.uuid;
    }
    resetForm();
    formStateSubjectLevel.subjectId = null;
    formStateSubjectLevel.teacherId = null;
    formStateSubjectLevel.coefficient = null;
    handleShowModalSubject(false, false);
  };

  const handleEditSubjectLevel = (record: ISubjectLevel) => {
    resetForm();
    formStateSubjectLevel.subjectId = record.subjects.uuid;
    formStateSubjectLevel.teacherId = record.users.uuid;
    formStateSubjectLevel.coefficient = record.coefficient;
    subjectLevelId.value = record.uuid;
    isEdit.value = true;
    isView.value = false;
  };
  //************End of actions datatable button method**********

  //*******Global method on submit form********************
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
          await updateLevel();
        } else {
          await insertLevel();
        }
      }
    });
  };

  const onSubmitFormSubjectLevel = async () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;

        if (isEdit.value) {
          await updateLevel();
        } else {
          await insertSubjectLevel();
        }
      }
    });
  };
  //******************Beginning of CRUD controller**************
  const insertLevel = async () => {
    const dataForm: FormLevel = {
      designation: formState.designation,
      teacherInChargeId: formState.teacherInChargeId,
    };

    try {
      //the params userId is null here because we are in the insert method
      await insertOrUpdateLevel(dataForm, null, 'POST');
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
      await getAllDataLevel();
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

  const updateLevel = async () => {
    const dataForm: FormLevel = {
      designation: formState.designation,
      teacherInChargeId: formState.teacherInChargeId,
    };

    try {
      //Call operation API in service
      await insertOrUpdateLevel(dataForm, levelId.value, 'PATCH');
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
      await getAllDataLevel();
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

  const deleteLevel = async () => {

    try {
      //Call operation API in service
      await deleteLevelService(levelId.value);
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
      await getAllDataLevel();
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

  const getAllDataLevel = async () => {
    try {
      loading.value = true;
      const response: Paginate<ILevel[]> = await getAllLevel(
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

  const getAllDataUsers = async () => {
    try {
      const response: Paginate<IUser[]> = await getAllUser(
          '',
          '',
          '',
          STCodeList.ACTIVE);
      response.data.map((item: IUser) => {
        if (optionsTeacher.value) {
          optionsTeacher.value.push({ value: item.uuid, label: `${item.lastName} ${item.firstName}` });
        }
      });

      await nextTick(); // Ensure the DOM updates before proceeding
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
        message: translations[language.value].success,
        description: (error as Error).message,
        class: 'custom-error-notification'
      });
    }
  }

  const getAllDataSubject = async () => {
    try {
      const response: Paginate<ISubject[]> = await getAllSubject(
          '',
          '',
          '',
          STCodeList.ACTIVE);

      response.data.map((item: ISubject) => {
        if (optionsSubject.value) {
          optionsSubject.value.push({ value: item.uuid, label: item.designation });
        }
      });

      await nextTick(); // Ensure the DOM updates before proceeding
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

  const insertSubjectLevel = async () => {
    const dataForm: FormSubjectLevel = {
      levelId: levelId.value,
      subjectId: formStateSubjectLevel.subjectId,
      teacherId: formStateSubjectLevel.teacherId,
      coefficient: formStateSubjectLevel.coefficient,
    };

    try {
      //the params id is null here because we are in the insert method
      await insertOrUpdateSubjectLevel(dataForm, null, 'POST');
      //turn off of loading button and close modal
      loadingBtn.value = false;
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });
      //reset form
      resetForm();
      formStateSubjectLevel.subjectId = null;
      formStateSubjectLevel.teacherId = null;
      formStateSubjectLevel.coefficient = null;
      //reload data
      await getAllDataSubjectLevel();
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

  const getAllDataSubjectLevel = async () => {
    try {
      loadingSubjectLevel.value = true;
      const response: Paginate<ISubjectLevel[]> = await getAllSubjectLevel(
          keywordSubjectLevel.value,
          pageSizeSubjectLevel.value,
          currentPageSubjectLevel.value,
          activeKey.value === '1' ? STCodeList.ACTIVE : STCodeList.DELETED,
          levelId.value,
      );
      dataSubjectLevel.value = response.data;
      totalPageSubjectLevel.value = response.totalRows;
      loadingSubjectLevel.value = false;
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
    getAllDataLevel();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllDataLevel();
  };

  const handleSearch = () => {
    currentPage.value = 1;
    getAllDataLevel();
  }

  const handleClickPaginatorSubjectLevel = () => {
    getAllDataSubjectLevel();
  };

  const handleChangePageSizeSubjectLevel = (value: SelectValue) => {
    pageSizeSubjectLevel.value = Number(value);
    currentPageSubjectLevel.value = 1;
    getAllDataSubjectLevel();
  };

  const handleSearchSubjectLevel = () => {
    currentPageSubjectLevel.value = 1;
    getAllDataSubjectLevel();
  }

  const handleClickTab = (key: string) => {
    pageSizeSubjectLevel.value = 10;
    currentPageSubjectLevel.value = 1;
    keywordSubjectLevel.value = '';
    activeKey.value = key;
    getAllDataSubjectLevel();
  }
  //******************End filter of and paginator methods****


  onMounted(() => {
    getAllDataLevel();
    getAllDataUsers();
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
          :showSizeChanger="false"
      />
    </a-col>
  </a-row>
  <!--Level modal-->
  <a-modal
      v-model:open="isOpenModal"
      closable
      :footer="null"
      title="Niveau"
      style="top: 20px"
      @ok=""
  >
    <a-row class="w-full">
      <a-col class="w-full">
        <a-form
            ref="formRefLevel"
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
              class="w-full mt-5"
          >
            <a-row>
              <a-col span="5"><label for="basic_designation"><span class="required_toil">*</span> {{translations[language].designation}}:</label></a-col>
              <a-col span="19">
                <a-input v-model:value="formState.designation" size="large" :placeholder="translations[language].designation" :disabled="isView"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="teacher"
              type="text"
              :rules="[]"
              class="w-full mt-5"
          >
            <a-row>
              <a-col span="5"><label for="basic_teacher">Enseignant(e) responsable:</label></a-col>
              <a-col span="19">
                <a-select
                    v-model:value="formState.teacherInChargeId"
                    show-search
                    placeholder="Selectionner un(e) enseignant(e)"
                    :options="optionsTeacher"
                    :filter-option="filterOption"
                ></a-select>
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
  <!--Subject level modal-->
  <a-modal
      v-model:open="isOpenModalSubject"
      closable
      :footer="null"
      title="Matièrs par niveaux"
      style="top: 20px"
      @ok=""
      width="700px"
  >
    <a-row class="w-full">
      <a-col class="w-full">
        <a-form
            ref="formRefSubjectLevel"
            :model="formStateSubjectLevel"
            name="subject_level"
            layout="inline"
            autocomplete="off"
            @finish="onSubmitFormSubjectLevel"
            style="border: 1px solid #bfbfbf; border-radius: 10px;"
        >
          <a-form-item
              name="subjectId"
              :rules="[{ required: true, message: 'Veuillez entrer selectionner une matière !' }]"
              class="w-10/12 m-5"
          >
            <a-row>
              <a-col span="5"><label for="basic_subject"><span class="required_toil">*</span> Matière :</label></a-col>
              <a-col span="19">
                <a-select
                    v-model:value="formStateSubjectLevel.subjectId"
                    show-search
                    placeholder="Selectionner une matière"
                    :options="optionsSubject"
                    :filter-option="filterOption"
                ></a-select>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="teacherId"
              type="text"
              :rules="[]"
              class="w-10/12 m-5"
          >
            <a-row>
              <a-col span="5"><label for="basic_teacher">Enseignant(e) :</label></a-col>
              <a-col span="19">
                <a-select
                    v-model:value="formStateSubjectLevel.teacherId"
                    show-search
                    placeholder="Selectionner un(e) enseignant(e)"
                    :options="optionsTeacher"
                    :filter-option="filterOption"
                ></a-select>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="coefficient"
              type="number"
              :rules="[
                {
                  async validator(_rule, value) {
                    if (value === null) {
                      throw new Error('Veuillez entrer le coefficient de la matière');
                    }
                    if (value % 10 !== 0) {
                      throw new Error('Le coefficient doit être un multiple de 10');
                    }
                  }
                }
              ]"
              class="w-10/12 m-5"
          >
            <a-row>
              <a-col span="5"><label for="basic_coefficient"><span class="required_toil">*</span> Coéfficient :</label></a-col>
              <a-col span="19">
                <a-input-number
                    v-model:value="formStateSubjectLevel.coefficient"
                    :min="10" :max="100"
                    :step="10"
                />
              </a-col>
            </a-row>
          </a-form-item>
          <a-row class="w-10/12 m-5">
            <a-form-item class="w-full flex justify-start">
              <a-button
                  class="btn btn--primary"
                  html-type="submit"
                  :loading="loading"
              >{{translations[language].save}}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
    <a-row class="w-full">
      <a-col class="w-full">
        <a-tabs v-model:activeKey="activeKey" centered>
          <a-tab-pane key="1">
            <template #tab>
              <span @click="() => handleClickTab('1')">
                <check-circle-filled />
                Actif
              </span>
            </template>
            <Suspense>
              <template #default>
                <!--Filter datatable-->
                <div v-if="activeKey === '1'">
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-5" span="12">
                      <a-select
                          ref="select"
                          v-model:value="pageSizeSubjectLevel"
                          style="width: 80px; text-align: center;"
                          @change="handleChangePageSizeSubjectLevel"
                      >
                        <a-select-option value="10">10</a-select-option>
                        <a-select-option value="25">25</a-select-option>
                        <a-select-option value="50">50</a-select-option>
                      </a-select>
                      <span> / page</span>
                    </a-col>
                  </a-row>
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-5" span="12">
                      <a-input type="text" class="w-56 h-9" v-model:value="keywordSubjectLevel" />&nbsp;
                      <a-button class="btn--primary" :icon="h(SearchOutlined)" @click="handleSearchSubjectLevel"/>
                    </a-col>
                  </a-row>
                  <!--Datatable-->
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-8" span="24">
                      <a-spin :spinning="loadingSubjectLevel" size="large">
                        <a-table
                            class="w-full"
                            :columns="columnsSubjectLevel"
                            :data-source="dataSubjectLevel"
                            :pagination="false"
                            :scroll="{ x: 700, y: 480 }"
                            bordered
                        />
                      </a-spin>
                    </a-col>
                  </a-row>
                  <!--Paginator datatable-->
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-8 flex justify-end" span="24">
                      <a-pagination
                          v-model:current="currentPageSubjectLevel"
                          v-model:pageSize="pageSizeSubjectLevel"
                          :total="totalPageSubjectLevel"
                          @prevClick="handleClickPaginatorSubjectLevel"
                          @change="handleClickPaginatorSubjectLevel"
                          @nextClick="handleClickPaginatorSubjectLevel"
                          :showSizeChanger="false"
                      />
                    </a-col>
                  </a-row>
                </div>
              </template>
            </Suspense>
          </a-tab-pane>
          <a-tab-pane key="2">
            <template #tab>
              <span @click="() => handleClickTab('2')">
                <delete-outlined/>
                Supprimé
              </span>
            </template>
            <Suspense>
              <template #default>
                <!--Filter datatable-->
                <div v-if="activeKey === '2'">
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-5" span="12">
                      <a-select
                          ref="select"
                          v-model:value="pageSizeSubjectLevel"
                          style="width: 80px; text-align: center;"
                          @change="handleChangePageSizeSubjectLevel"
                      >
                        <a-select-option value="10">10</a-select-option>
                        <a-select-option value="25">25</a-select-option>
                        <a-select-option value="50">50</a-select-option>
                      </a-select>
                      <span> / page</span>
                    </a-col>
                  </a-row>
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-5" span="12">
                      <a-input type="text" class="w-56 h-9" v-model:value="keywordSubjectLevel" />&nbsp;
                      <a-button class="btn--primary" :icon="h(SearchOutlined)" @click="handleSearchSubjectLevel"/>
                    </a-col>
                  </a-row>
                  <!--Datatable-->
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-8" span="24">
                      <a-spin :spinning="loadingSubjectLevel" size="large">
                        <a-table
                            class="w-full"
                            :columns="columnsSubjectLevel"
                            :data-source="dataSubjectLevel"
                            :pagination="false"
                            :scroll="{ x: 700, y: 480 }"
                            bordered
                        />
                      </a-spin>
                    </a-col>
                  </a-row>
                  <!--Paginator datatable-->
                  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
                    <a-col class="mt-8 flex justify-end" span="24">
                      <a-pagination
                          v-model:current="currentPageSubjectLevel"
                          v-model:pageSize="pageSizeSubjectLevel"
                          :total="totalPageSubjectLevel"
                          @prevClick="handleClickPaginatorSubjectLevel"
                          @change="handleClickPaginatorSubjectLevel"
                          @nextClick="handleClickPaginatorSubjectLevel"
                          :showSizeChanger="false"
                      />
                    </a-col>
                  </a-row>
                </div>
              </template>
            </Suspense>
          </a-tab-pane>
        </a-tabs>
      </a-col>
    </a-row>
  </a-modal>
</template>

<style scoped>

</style>