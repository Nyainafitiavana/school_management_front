<script setup lang="ts">
import type {FormStateUser, IUser} from "~/composables/settings/User/User.interface";
  import {getOneUser, insertOrUpdateUser} from "~/composables/settings/User/user.service";
  import {handleInAuthorizedError} from "~/composables/CustomError";
  import {createVNode, ref} from "vue";
  import {ExclamationCircleOutlined} from "#components";
  import {translations} from "~/composables/translations";

  definePageMeta({
    layout: 'navbar',
    title: 'Profile',
    middleware: ['user-middleware']
  });

  //This is a global state for language of the app
  const language = useLanguage();
  const isLoading = ref<boolean>(true);

  const route = useRoute();

  const formState = reactive<FormStateUser>({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
  });

  onMounted(async () => {
    const userId: string = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
    await getDataForm(userId);
    isLoading.value = false;
  });

  const getDataForm = async (id: string) => {
    try {
      const user: IUser = await getOneUser(id);
      //set all value of formState when we have a data
      formState.email = user.email;
      formState.firstName = user.firstName;
      formState.lastName = user.lastName;
      formState.phone = user.phone;

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

  const onSubmitForm = async () => {
    Modal.confirm({
      title: translations[language.value].confirmationTitle,
      icon: createVNode(ExclamationCircleOutlined),
      content: translations[language.value].confirmationDescription,
      okText: translations[language.value].yes,
      cancelText: translations[language.value].no,
      onOk: async () => {
        await updateProfile();
      }
    });
  };

  const updateProfile = async () => {
    const values: FormStateUser = formState;
    const dataForm: IUser = {
      email: values.email,
      firstName: values.firstName,
      lastName: values.lastName,
      phone: values.phone,
    };

    try {
      //run loading spin
      isLoading.value = true;
      const userId: string = Array.isArray(route.params.id) ? route.params.id[0] : route.params.id;
      await insertOrUpdateUser(dataForm, userId, 'PATCH');
      // Show success notification
      notification.success({
        message: translations[language.value].success,
        description: translations[language.value].successDescription,
        class: 'custom-success-notification'
      });
      //hide loading spin
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
        message: 'Error',
        description: (error as Error).message,
        class: 'custom-error-notification'
      });
    }
  }
</script>

<template>
  <div>
    <Title>{{translations[language].profile}}</Title>
    <ATypographyTitle class="flex" style="font-size: 20px;">
      <user-outlined  />&nbsp;
      <span>{{translations[language].profile}}</span>
    </ATypographyTitle>
    <Loading :is-loading="isLoading" :size="'large'"/>
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
              name="email"
              type="email"
              :rules="[{ required: true, type: 'email', message: translations[language].errorEmail }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_email"><span class="required_toil">*</span> Email:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.email" size="large" placeholder="E-mail"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="lastName"
              type="text"
              :rules="[{ required: true, message: translations[language].errorLastName }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_lastName"><span class="required_toil">*</span> {{translations[language].lastName}}:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.lastName" size="large" placeholder="Last Name"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="firstName"
              type="text"
              :rules="[{ required: true, message: translations[language].errorFirstName }]"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_firstName"><span class="required_toil">*</span> {{translations[language].firstName}}:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.firstName" size="large" placeholder="First Name"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-form-item
              name="phone"
              type="text"
              class="w-full mt-10"
          >
            <a-row>
              <a-col span="4"><label for="basic_phone">{{translations[language].phoneNumber}}:</label></a-col>
              <a-col span="12">
                <a-input v-model:value="formState.phone" size="large" placeholder="Phone number"></a-input>
              </a-col>
            </a-row>
          </a-form-item>
          <a-row class="mt-10">
            <a-form-item class="w-full">
              <a-button class="btn btn--primary w-full" html-type="submit" size="large">{{translations[language].updateProfile}}</a-button>
            </a-form-item>
          </a-row>
        </a-form>
      </a-col>
    </a-row>
  </div>
</template>

<style scoped>

</style>