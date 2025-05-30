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
  import type {ISubjectLevel} from "~/composables/Level/level.interface";
  import type {SelectProps} from "ant-design-vue/lib";
  import {DiffOutlined} from "@ant-design/icons-vue";
  import type {FormMenuRole, FormRole, IRole, IRoleMenu} from "~/composables/Roles/role.interface";
  import {deleteRoleService, getAllRolesService, insertOrUpdateRole} from "~/composables/Roles/role.service";
  import type {IDataMenuRole, Menu} from "~/composables/menu/menu.interface";
  import {
    deleteMenuRoleService,
    getAllMenuRoleService,
    getAllMenuService,
    insertOrUpdateMenuRole
  } from "~/composables/menu/menu.service";


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
  const data = ref<IRole[]>([]);
  const isOpenModal = ref<boolean>(false);
  const isOpenModalMenu = ref<boolean>(false);
  const isEdit = ref<boolean>(false);
  const isView = ref<boolean>(false);
  const formRefRole = ref<FormInstance>();
  const formRefMenuRole = ref<FormInstance>();
  const roleId = ref<string>('');
  const formState = reactive<FormRole>({designation: null,});
  const formStateMenuRole = reactive<FormMenuRole>({
    menuId: null, 
    privilege: []
  });
  const optionsMenu = ref<SelectProps['options']>([]);
  const optionsPrivilege = ref<SelectProps['options']>([
    {label: 'Créer', value: 1},
    {label: 'Visualiser', value: 2},
    {label: 'Modifier', value: 3},
    {label: 'Supprimer', value: 4}
  ]);
  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };
  const dataRoleMenu = ref<IRoleMenu[]>([]);
  const menuRoleId = ref<string>('');
  const loadingMenu = ref<boolean>(false);
  //*********Beginning of datatables column***************
  const activeActionsColumns = {
    title: h('div', { style: { textAlign: 'center' } }, ['Actions']),
    key: 'actions',
    width: 200,
    customRender: ({ record }: { record: IRole }) => h('div', { class: 'flex justify-center' }, [
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
      h(ATooltip, { title: 'Gérer les menu', color: '#E3B23EFF' }, [
        h(AButton, {
          class: 'btn--warning-outline btn-tab',
          size: 'middle',
          style: { marginRight: '8px' },
          onClick: () => handleShowMenuRole(record)
        }, [h(DiffOutlined)]),
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
    customRender: ({ record }: { record: IRole }) => h('div', [
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
      width: 200,
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, [translations[language.value].status]),
      key: 'status',
      width: 200,
      customRender: ({ record }: { record: IRole}) => h('div', [
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

  const actionLabels = {
    1: 'Créer',
    2: 'Visualiser',
    3: 'Modifier',
    4: 'Supprimer'
  }

  const columnsMenuRole = computed(() => [
    {
      title: h('div', { style: { textAlign: 'center' } }, ['Désignation']),
      key: 'designation',
      width: 150,
      customRender: ({ record }: { record: IRoleMenu}) => h('div', [
        `${record.menu ? record.menu.designation : ''}`
      ])
    },
    {
      title: h('div', { style: { textAlign: 'center' } }, ['Privilèges']),
      key: 'privilege',
      customRender: ({ record }: { record: IRoleMenu }) => {
        const privileges = JSON.parse(record.privilege);
        return privileges
            .map((item) => actionLabels[item] || 'Inconnu')
            .join(', ');
      }
    },
    {
      title: 'Actions',
      key: 'actions',
      width: 110,
      customRender: ({ record }: { record: IRoleMenu }) => h('div', [
        h(ATooltip, { title: translations[language.value].update, color: 'blue' }, [
          h(AButton, {
            class: 'btn--primary-outline btn-tab',
            size: 'middle',
            style: { marginRight: '8px' },
            onClick: () => handleEditMenuRole(record)
          }, [h(FormOutlined)]),
        ]),
        h(ATooltip, { title: translations[language.value].delete, color: '#ff5959' }, [
          h(AButton, {
            class: 'btn--danger-outline btn-tab',
            size: 'middle',
            onClick: () => handleDeleteMenuRole(record)
          }, [h(DeleteOutlined)])
        ]),
      ])
    },
  ]);
  //*********End of datatables column***************

  //**********Reset all value and validator form*******
  const resetForm = () => {
    if (formRefRole.value) {
      formRefRole.value.resetFields();
    }

    if (formRefMenuRole.value) {
      formRefMenuRole.value.resetFields();
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

  const handleShowModalMenuRole = () => {
    isOpenModalMenu.value = true;
    getAllDataMenuRole();
  }

  const handleCancelActionMenuRole = () => {
    resetForm();
    formStateMenuRole.menuId = null;
    formStateMenuRole.privilege = [];

    isEdit.value = false;
  }
  //************End of modal actions*********************

  //************Add button action*********
  const handleAdd = () => {
    resetForm();
    formState.designation = null;
    handleShowModal(false, false);
  }


  //************Beginning of actions datatable button method**********
  const handleView = (record: IRole) => {
    resetForm();
    formState.designation = record.designation;

    handleShowModal(false, true);
  };

  const handleEdit = (record: IRole) => {
    resetForm();
    formState.designation = record.designation;

    if (record.uuid != null) {
      roleId.value = record.uuid;
    }

    handleShowModal(true, false);
  };

  const handleDelete = (record: IRole) => {
    if (record.uuid != null) {
      roleId.value = record.uuid;
    }

    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await deleteRole();
      }
    });
  };

  const handleShowMenuRole = (record: IRole) => {
    if (record.uuid != null) {
      roleId.value = record.uuid;
    }
    resetForm();
    formStateMenuRole.menuId = null;
    formStateMenuRole.privilege = [];
    handleShowModalMenuRole(false, false);
  };

  const handleEditMenuRole = (record: IRoleMenu) => {
    resetForm();
    formStateMenuRole.menuId = record.menu.uuid;
    formStateMenuRole.privilege = JSON.parse(record.privilege);
    menuRoleId.value = record.uuid;
    isEdit.value = true;
    isView.value = false;
  };

  const handleDeleteMenuRole = (record: ISubjectLevel) => {
    if (record.uuid != null) {
      menuRoleId.value = record.uuid;
    }

    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;
        await deleteMenuRole();
      }
    });
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
          await updateRole();
        } else {
          await insertRole();
        }
      }
    });
  };

  const onSubmitFormMenuRole = async () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        loadingBtn.value = true;

        if (isEdit.value) {
          await updateMenuRole();
        } else {
          await insertMenuRole();
        }
      }
    });
  };
  //******************Beginning of CRUD controller**************
  const insertRole = async () => {
    const dataForm: FormRole = {
      designation: formState.designation,
    };

    try {
      //the params userId is null here because we are in the insert method
      await insertOrUpdateRole(dataForm, null, 'POST');
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
      await getAllDataRole();
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

  const updateRole = async () => {
    const dataForm: FormRole = {
      designation: formState.designation,
    };

    try {
      //Call operation API in service
      await insertOrUpdateRole(dataForm, roleId.value, 'PATCH');
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
      await getAllDataRole();
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

  const deleteRole = async () => {

    try {
      //Call operation API in service
      await deleteRoleService(roleId.value);
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
      await getAllDataRole();
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

  const getAllDataRole = async () => {
    try {
      loading.value = true;
      const response: Paginate<IRole[]> = await getAllRolesService(
          pageSize.value,
          currentPage.value,
          keyword.value,
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

  const getAllDataMenu = async () => {
    try {
      const response: NoPaginateData<Menu[]> = await getAllMenuService();

      response.data.map((item: Menu) => {
        if (optionsMenu.value) {
          optionsMenu.value.push({ value: item.uuid, label: item.designation });
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

  const insertMenuRole = async () => {
    const dataForm: IDataMenuRole = {
      roleId: roleId.value,
      menuId: formStateMenuRole.menuId,
      privilege: JSON.stringify(formStateMenuRole.privilege),
    };

    try {
      //the params id is null here because we are in the insert method
      await insertOrUpdateMenuRole([dataForm], 'POST');
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
      formStateMenuRole.menuId = null;
      formStateMenuRole.privilege = [];
      //reload data
      await getAllDataMenuRole();
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

  const updateMenuRole = async () => {
    const dataForm = {
      menuRoleId: menuRoleId.value,
      privilege: JSON.stringify(formStateMenuRole.privilege),
    };

    try {
      //Call operation API in service
      await insertOrUpdateMenuRole([dataForm], 'PATCH');
      //turn off of loading button and close modal
      loadingBtn.value = false;
      resetForm();
      formStateMenuRole.menuId = null;
      formStateMenuRole.privilege = [];
      isEdit.value = false;
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });

      //reload data
      await getAllDataMenuRole();
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

  const getAllDataMenuRole = async () => {
    try {
      loadingMenu.value = true;
      const response: NoPaginateData<IRoleMenu[]> = await getAllMenuRoleService(roleId.value);
      dataRoleMenu.value = response.data;
      loadingMenu.value = false;
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

  const deleteMenuRole = async () => {

    try {
      //Call operation API in service
      await deleteMenuRoleService(menuRoleId.value);
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
      await getAllDataMenuRole();
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
    getAllDataRole();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllDataRole();
  };

  const handleSearch = () => {
    currentPage.value = 1;
    getAllDataRole();
  }
  //******************End filter of and paginator methods****


  onMounted(() => {
    getAllDataRole();
    getAllDataMenu();
  })
</script>

<template>
  <!--Filter datatable-->
  <a-row class="w-full pt-8 gap-4 grid grid-cols-1 md:grid-cols-1 lg:grid-cols-3">
    <a-col>
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

    <a-col>
      <a-button :icon="h(PlusOutlined)" @click="handleAdd" v-if="props.activePage === STCodeList.ACTIVE" class="btn--success">{{translations[language].add}}</a-button>
    </a-col>
    <a-col class="w-full flex justify-start md:justify-start lg:justify-end">
      <a-input type="text" class="w-40 md:w-40 lg:w-64" v-model:value="keyword" />&nbsp;
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
  <!--Role modal-->
  <a-modal
      v-model:open="isOpenModal"
      closable
      :footer="null"
      title="Rôle"
      style="top: 20px"
      @ok=""
  >
    <a-row class="w-full">
      <a-col class="w-full">
        <a-form
            ref="formRefRole"
            :model="formState"
            name="basic"
            layout="inline"
            autocomplete="off"
            @finish="onSubmitForm"
        >
          <a-form-item
              name="designation"
              type="text"
              :roles="[{ required: true, message: translations[language].errorDesignation }]"
              class="w-full mt-5"
          >
            <a-row class="w-full md:gap-4 flex flex-col md:flex-row lg:flex-row">
              <a-col class="w-48"><label for="basic_designation"><span class="required_toil">*</span> {{translations[language].designation}}:</label></a-col>
              <a-col class="w-64">
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
  <!--Menu role modal-->
  <a-modal
      v-model:open="isOpenModalMenu"
      closable
      :footer="null"
      title="Menu par rôles"
      style="top: 20px"
      @ok=""
      width="768px"
  >
    <a-row class="w-full">
      <a-col class="w-full">
        <a-form
            ref="formRefMenuRole"
            :model="formStateMenuRole"
            name="subject_level"
            layout="inline"
            autocomplete="off"
            @finish="onSubmitFormMenuRole"
            style="border: 1px solid #bfbfbf; border-radius: 10px;"
        >
          <a-form-item
              name="menu"
              :roles="[{ required: true, message: 'Veuillez selectionner un menu !' }]"
              class="w-10/12 m-5"
          >
            <a-row class="flex gap-1 md:gap-16 lg:gap-16 justify-start flex-col md:flex-row lg:flex-row">
              <a-col class="w-24">
                <label for="basic_menu">
                  <span class="required_toil">*</span>
                  Menu :
                </label>
              </a-col>
              <a-col class="w-full md:w-96 lg:w-96">
                <a-select
                    v-model:value="formStateMenuRole.menuId"
                    show-search
                    placeholder="Selectionner un menu"
                    :options="optionsMenu"
                    :filter-option="filterOption"
                ></a-select>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="privilege"
              class="w-10/12 m-5"
          >
            <a-row class="flex gap-1 md:gap-16 lg:gap-16 justify-start flex-col md:flex-row lg:flex-row">
              <a-col class="w-24">
                <label for="basic_privilege">Privilège(s) :</label>
              </a-col>
              <a-col class="w-full md:w-96 lg:w-96">
                <a-select
                    v-model:value="formStateMenuRole.privilege"
                    mode="multiple"
                    placeholder="Selectionner un menu"
                    :options="optionsPrivilege"
                ></a-select>
              </a-col>
            </a-row>
          </a-form-item>
          <a-row class="w-10/12 m-5">
            <a-form-item class="w-full flex justify-start">
              <a-button class="btn btn--default" size="middle" @click="handleCancelActionMenuRole">{{translations[language].cancel}}</a-button>
              <a-button
                  class="btn btn--primary ml-5"
                  html-type="submit"
                  :loading="loading"
              >{{translations[language].save}}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
    <a-row class="w-full">
      <a-col class="mt-8" span="24">
        <a-spin :spinning="loadingMenu" size="large">
          <a-table
              class="w-full"
              :columns="columnsMenuRole"
              :data-source="dataRoleMenu"
              :pagination="false"
              :scroll="{ x: 700, y: 480 }"
              bordered
          />
        </a-spin>
      </a-col>
    </a-row>
  </a-modal>
</template>

<style scoped>

</style>