<script setup lang="ts">
  import {loginUser} from "~/composables/Auth/auth.service";
  import type {AuthInterface} from "~/composables/Auth/auth.interface";
  interface FormState {
    email: string;
    password: string;
  }
  const formState = reactive<FormState>({
    email: '',
    password: '',
  });

  const onFinish = async (values: FormState) => {
    const {email, password} = values;

    try {
      const data: AuthInterface = await loginUser({email, password});
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('userId', data.id.toString());

      notification.success({
        message: 'Login Successful',
        description: 'You are now logged in!',
        class: 'custom-success-notification'
      });

      await navigateTo(RouteList.WELCOME);

    } catch (error) {
      notification.error({
        message: 'Login Failed',
        description: error.message,
        class: 'custom-error-notification'
      });
    }
  };

  onMounted(() => {
    const accessToken = localStorage.getItem('access_token');

    if (accessToken) {
      navigateTo(RouteList.WELCOME);
    }
  });
</script>

<template>
  <Title>Login</Title>
  <a-layout class="layout-login">
    <a-row class="flex justify-center items-center h-screen">
      <a-col :span="7">
        <a-card :bordered="false">
          <a-row class="mt-8">
            <a-col :span="24" class="flex justify-center items-center">
              <img src="/logo_466x231.png" class="logo-login" alt="" width="466" height="231" />
            </a-col>
          </a-row>
          <a-row class="mb-8">
            <a-col :span="24">
              <a-form
                  :model="formState"
                  name="horizontal_login"
                  layout="inline"
                  autocomplete="off"
                  @finish="onFinish"
              >
                <a-form-item
                    label=""
                    name="email"
                    type="email"
                    :roles="[{ required: true, type: 'email', message: 'The input is not a valid email format!' }]"
                    class="w-full mt-10"
                >
                  <a-input v-model:value="formState.email" size="large" placeholder="E-mail">
                    <template #prefix>
                      <IconsEnvelope class="secondary-color" style="font-size: 16px;"/>
                    </template>
                  </a-input>
                </a-form-item>
                <a-form-item
                    label=""
                    name="password"
                    :roles="[{ required: true, message: 'Please input your password!' }]"
                    class="w-full mt-5"
                    aria-placeholder="password"
                >
                  <a-input-password v-model:value="formState.password" size="large" placeholder="Password">
                    <template #prefix>
                      <IconsLocks class="secondary-color" style="font-size: 20px;"/>
                    </template>
                  </a-input-password>
                </a-form-item>
                <a-row class="w-full mt-10">
                  <a-form-item class="w-full">
                    <a-button class="btn btn--primary w-full" html-type="submit" size="large">Log in</a-button>
                  </a-form-item>
                </a-row>
              </a-form>
            </a-col>
          </a-row>
          <a-row class="mt-8">
            <a-col :span="24" class="flex justify-center items-center">
              <a style="color: #b4b4b4; font-size: 11px;" href="https://ny-aina-fitiavana.vercel.app/" target="_blank">
                Created by Ny Aina Fitiavana FITAHIANTSOA in 2024
              </a>
            </a-col>
          </a-row>
        </a-card>
      </a-col>
    </a-row>
  </a-layout>
</template>

<style scoped>
  .layout-login {
    background-color: #ececec;
  }
  .logo-login {
    width: 266px;
  }
</style>
