<script setup lang="ts">
  import type {IInvoice} from "~/composables/Inventory/Movement.interface";
  import {formatDateString} from "~/composables/helper";
  import {h} from "vue";
  import {translations} from "~/composables/translations";
  import {AButton, ASelect, ATooltip, SearchOutlined} from "#components";
  import {EyeOutlined, FilterOutlined} from "@ant-design/icons-vue";
  import {EnvApiConfig} from "~/composables/Env.config";
  import type {Paginate} from "~/composables/apiResponse.interface";
  import {getAllInvoiceService} from "~/composables/Inventory/movement.service";
  import {handleInAuthorizedError} from "~/composables/CustomError";
  import type {RangeValue} from "~/composables/dayJs.type";

  //**************Beginning of state management**************
  //This is a global state for language of the app
  const language = useLanguage();
  const dateFilter = ref<RangeValue>();
  const currencyType = ref<string>('');
  const loadingInvoiceMovement = ref<boolean>(false);
  const reference = ref<string>('');
  const pageSize = ref<number>(10);
  const currentPage = ref<number>(1);
  const totalPage = ref<number>(0);
  const invoiceListMovement = ref<IInvoice[]>([]);
  const pdfUrl = ref<string>('');
  const isOpenModalViewPdf = ref<boolean>(false);

  const columnsInvoiceList = computed<any>(() => [
    {
      title: translations[language.value].reference,
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

  //************Beginning of actions datatable button method**********
  const handleSearch = () => {
    currentPage.value = 1;
    getAllListInvoice();
  }

  const handleShowInvoicePdf = (record: IInvoice) => {
    pdfUrl.value = `${EnvApiConfig.host}:${EnvApiConfig.port}${API.INVOICE_PDF}${record.fileName}` ;
    isOpenModalViewPdf.value = true;
  }
  //************End of actions datatable button method**********

  //******************Beginning of filter and paginator methods****
  const handleClickPaginator = () => {
    getAllListInvoice();
  };

  const handleChangePageSize = (value: SelectValue) => {
    pageSize.value = Number(value);
    currentPage.value = 1;
    getAllListInvoice();
  };

  const handleFilterByDate = () => {
    getAllListInvoice();
  }
  //******************End filter of and paginator methods****

  //******************Beginning of CRUD controller**************
  const getAllListInvoice = async () => {
    try {
      loadingInvoiceMovement.value = true;
      let startDateStr: string = '';
      let endDateStr: string = '';

      if (dateFilter.value) {
        const [startDate, endDate] = dateFilter.value;
        startDateStr = startDate.format('YYYY-MM-DD');
        endDateStr = endDate.format('YYYY-MM-DD');
      }

      const response: Paginate<IInvoice[]> = await getAllInvoiceService(
          reference.value,
          pageSize.value,
          currentPage.value,
          startDateStr,
          endDateStr
      );
      invoiceListMovement.value = response.data;
      totalPage.value = response.totalRows;
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
  //******************End of CRUD controller**************

  onMounted(() => {
    getAllListInvoice();
  })
</script>

<template>
  <!--Filter datatable-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
    <!--Page size select-->
    <a-col class="mt-8" span="6">
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
    <!--Filter by date-->
    <a-col class="mt-8 flex justify-end" span="14">
      <a-range-picker
          v-model:value="dateFilter"
          :placeholder="[translations[language].startDate, translations[language].endDate]"
      />
      <a-button class="btn--primary ml-2" :icon="h(FilterOutlined)" @click="handleFilterByDate"/>
    </a-col>
    <!-- Search input -->
    <a-col class="mt-8 flex justify-end" span="4">
      <a-input type="text" class="w-48 h-9" v-model:value="reference" :placeholder="translations[language].reference"/>&nbsp;
      <a-button class="btn--primary" :icon="h(SearchOutlined)" @click="handleSearch"/>
    </a-col>
  </a-row>
  <!--Datatable invoice list-->
  <a-row :gutter="{ xs: 8, sm: 16, md: 24, lg: 32 }">
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
</template>

<style scoped>

</style>