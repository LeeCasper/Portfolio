<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { useRouter } from 'vue-router';
import { NButton, NCard, NGrid, NGridItem, NStatistic } from 'naive-ui';
import { fetchPosts, fetchProfile, fetchProjects, fetchWorks } from '@/service/api/portfolio';

defineOptions({ name: 'Dashboard' });

const router = useRouter();

const loading = ref(false);
const counts = ref({
  projects: 0,
  posts: 0,
  works: 0,
  profile: 0
});

async function load() {
  loading.value = true;

  const [projects, posts, works, profile] = await Promise.all([
    fetchProjects(),
    fetchPosts(),
    fetchWorks(),
    fetchProfile()
  ]);

  counts.value = {
    projects: projects.data?.length ?? 0,
    posts: posts.data?.length ?? 0,
    works: works.data?.length ?? 0,
    profile: profile.data && typeof profile.data === 'object' ? 1 : 0
  };

  loading.value = false;
}

onMounted(load);

const cards = [
  { key: 'projects', title: '项目', route: 'projects' },
  { key: 'posts', title: '文章', route: 'posts' },
  { key: 'works', title: '作品', route: 'works' },
  { key: 'profile', title: '个人信息', route: 'profile' }
] as const;
</script>

<template>
  <div class="flex flex-col gap-16px">
    <NCard title="欢迎使用作品集管理后台" :bordered="false">
      <p class="text-14px text-gray-500">
        在左侧菜单维护项目、文章、作品与个人信息。保存后公开站点会实时读取后端数据，无需重新构建。
      </p>
    </NCard>

    <NGrid :cols="4" :x-gap="16" :y-gap="16">
      <NGridItem v-for="card in cards" :key="card.key">
        <NCard :title="card.title" :loading="loading">
          <NStatistic :value="counts[card.key]" />
          <template #footer>
            <NButton text type="primary" @click="router.push({ name: card.route })">去管理</NButton>
          </template>
        </NCard>
      </NGridItem>
    </NGrid>
  </div>
</template>

<style scoped></style>
