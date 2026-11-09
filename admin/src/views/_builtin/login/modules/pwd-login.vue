<script setup lang="ts">
import { reactive } from 'vue';
import { useAuthStore } from '@/store/modules/auth';
import { useNaiveForm } from '@/hooks/common/form';

defineOptions({
  name: 'PwdLogin'
});

const authStore = useAuthStore();
const { formRef, validate } = useNaiveForm();

interface FormModel {
  token: string;
}

const model: FormModel = reactive({
  token: ''
});

const rules: Record<keyof FormModel, App.Global.FormRule> = {
  token: {
    required: true,
    message: '请输入管理员 Token',
    trigger: ['input', 'blur']
  }
};

async function handleSubmit() {
  await validate();
  await authStore.login(model.token.trim());
}
</script>

<template>
  <NForm ref="formRef" :model="model" :rules="rules" size="large" :show-label="false" @keyup.enter="handleSubmit">
    <NFormItem path="token">
      <NInput
        v-model:value="model.token"
        type="password"
        show-password-on="click"
        placeholder="请输入管理员 Token"
        autocomplete="off"
      />
    </NFormItem>
    <NButton type="primary" size="large" round block :loading="authStore.loginLoading" @click="handleSubmit">
      登录
    </NButton>
  </NForm>
</template>

<style scoped></style>
