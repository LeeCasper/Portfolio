<script setup lang="ts">
defineOptions({
  name: 'GlobalFooter'
});
</script>

<template>
  <DarkModeContainer class="h-full flex-center">
    <span>© {{ new Date().getFullYear() }} 李聪</span>
  </DarkModeContainer>
</template>

<style scoped></style>
