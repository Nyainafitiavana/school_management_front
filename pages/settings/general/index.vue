<script setup lang="ts">
import {handleInAuthorizedError} from "~/composables/CustomError";
import {createVNode, ref} from "vue";
import {AButton, AInputNumber, ATooltip, ExclamationCircleOutlined} from "#components";
import {translations} from "~/composables/translations";
import type {ISettings} from "~/composables/settings/general/settings.interface";
import type {SelectProps} from "ant-design-vue/lib";
import {getSettingsService, updateSettingsService} from "~/composables/settings/general/settings.service";
import {formatPrice} from "~/composables/helper";

definePageMeta({
    layout: 'navbar',
    title: 'Settings',
    middleware: ['user-middleware', 'admin-middleware']
  });

  //This is a global state for language of the app
  const language = useLanguage();
  const isLoading = ref<boolean>(true);
  const optionsCurrency = ref<SelectProps['options']>(language.value === 'ENG' ? currencyOptionEn : currencyOptionsFr);
  const idSettings = ref<string>('');
  const isUpdateInitialCash = ref<boolean>(false);

  const formState = reactive<ISettings>({
    currencyType: 'USD',
    companyName: '',
    companyEmail: '',
    companyAddress: '',
    companyPhoneNumber: '',
    initialCash: 0,
  });
  const initialCashFormated = ref<string>('0.00');

  const filterOption = (input: string, option: any) => {
    return option?.label?.toLowerCase().includes(input.toLowerCase());
  };

  // Watch the language and update the option
  watchEffect(() => {
    optionsCurrency.value = language.value === 'ENG' ? currencyOptionEn : currencyOptionsFr;
  });

  const handleUpdateInitialCash = () => {
    isUpdateInitialCash.value = true;
  }

  const getSettings = async () => {
    try {
      const settings: ISettings = await getSettingsService();
      idSettings.value = settings.uuid;
      //set all value of formState when we have a data
      formState.companyName = settings.companyName;
      formState.currencyType = settings.currencyType;
      formState.companyEmail = settings.companyEmail;
      formState.companyAddress = settings.companyAddress;
      formState.companyPhoneNumber = settings.companyPhoneNumber;
      formState.initialCash = settings.initialCash;
      initialCashFormated.value = formatPrice(settings.initialCash);
      isLoading.value = false;

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
      isLoading.value = false;
    }
  }

  const onSubmitForm = async () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        await updateSettings();
      }
    });
  };

  const updateSettings = async () => {

    try {
      //run loading spin
      isLoading.value = true;
      await updateSettingsService(formState, idSettings.value);
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });
      //hide loading spin
      isLoading.value = false;
      //hide input initial cash
      isUpdateInitialCash.value = false;
      //reload data
      await getSettings();
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
      isLoading.value = false;
    }
  }

  onMounted(async () => {
    await getSettings();
  });
</script>

<template>
  <div>
    <Title>{{translations[language].settings_generale}}</Title>
    <ATypographyTitle class="flex" style="font-size: 20px;">
      <ToolOutlined  />&nbsp;
      <span>{{translations[language].settings_generale}}</span>
    </ATypographyTitle>
    <Loading :is-loading="isLoading" :size="'middle'"/>
    <a-row v-if="!isLoading">
      <a-col class="w-full">
        <a-form
            :model="formState"
            name="basic"
            layout="inline"
            autocomplete="off"
            @finish="onSubmitForm"
        >
          <a-form-item
              name="companyName"
              type="text"
              class="w-full mt-10"
              :rules="[{ required: true, message: translations[language].errorCompanyName }]"
          >
            <a-row>
              <a-col span="4"><label for="basic_companyName"><span class="required_toil">*</span> {{ translations[language].companyName }}:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.companyName" size="middle" :placeholder="translations[language].companyName"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="currencyType"
              type="text"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_currencyType"><span class="required_toil">*</span> {{ translations[language].currencyType }}:</label></a-col>
              <a-col span="12">
                <a-select
                    class="w-44"
                    v-model:value="formState.currencyType"
                    show-search
                    :options="optionsCurrency"
                    :filter-option="filterOption"
                />
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="initialCash"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_initialCash">{{ translations[language].initialCash }}:</label></a-col>
              <a-col span="12" v-if="!isUpdateInitialCash">
                <h2 class="mt-0.5">
                  {{ initialCashFormated }} {{ formState.currencyType }}
                  <span>
                    <a-tooltip :title="translations[language].update" :color="'#05c5c5'">
                      <FormOutlined class="info-color" style="font-size: 20px;" @click="handleUpdateInitialCash" />
                    </a-tooltip>
                  </span>
                </h2>
              </a-col>
              <a-col span="12" v-if="isUpdateInitialCash">
                <a-input-number v-model:value="formState.initialCash" :min="0">
                  <template #addonAfter>{{ formState.currencyType }}</template>
                </a-input-number>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="companyEmail"
              type="email"
              :rules="[{ required: true, type: 'email', message: translations[language].errorEmail }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_companyEmail"><span class="required_toil">*</span> Email:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.companyEmail" size="middle" placeholder="Email"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="companyAddress"
              type="text"
              class="w-full mt-10"
              :rules="[{ required: true, message: translations[language].errorCompanyAddress }]"
          >
            <a-row>
              <a-col span="4"><label for="basic_companyAddress"><span class="required_toil">*</span> {{ translations[language].companyAddress }}:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.companyAddress" size="middle" :placeholder="translations[language].companyAddress"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="companyPhoneNumber"
              type="text"
              class="w-full mt-10"
              :rules="[{ required: true, message: translations[language].errorCompanyPhoneNumber }]"
          >
            <a-row>
              <a-col span="4"><label for="basic_companyPhoneNumber"><span class="required_toil">*</span> {{ translations[language].companyPhoneNumber }}:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.companyPhoneNumber" size="middle" :placeholder="translations[language].companyPhoneNumber"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-row class="mt-10">
            <a-form-item class="w-full">
              <a-button class="btn btn--primary w-full" html-type="submit" size="middle">{{translations[language].updateSettings}}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>

</style>