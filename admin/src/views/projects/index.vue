<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NForm,
  NFormItem,
  NInput,
  NInputNumber,
  NModal,
  NSpace,
  NSwitch,
  NTag,
  type DataTableColumns
} from 'naive-ui';
import {
  createProject,
  deleteProject,
  fetchProjects,
  updateProject,
  type ProjectItem,
  type ProjectPayload
} from '@/service/api/portfolio';
import { joinTags, splitTags, useMediaUpload } from '@/hooks/common/media-upload';

defineOptions({ name: 'Projects' });

interface FormModel {
  title: string;
  link: string;
  description: string;
  coverImagePath: string;
  videoPath: string;
  tags: string;
  sortOrder: number;
  featured: boolean;
  published: boolean;
}

function createEmptyModel(): FormModel {
  return {
    title: '',
    link: '',
    description: '',
    coverImagePath: '',
    videoPath: '',
    tags: '',
    sortOrder: 0,
    featured: false,
    published: true
  };
}

const loading = ref(false);
const saving = ref(false);
const items = ref<ProjectItem[]>([]);
const modalVisible = ref(false);
const editingId = ref<number | null>(null);
const model = reactive<FormModel>(createEmptyModel());

const coverInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const { uploading, upload } = useMediaUpload('projects-cover');

const rowKey = (row: ProjectItem) => row.id;

async function load() {
  loading.value = true;
  const { data } = await fetchProjects();
  if (data) items.value = data;
  loading.value = false;
}

onMounted(load);

function openCreate() {
  editingId.value = null;
  Object.assign(model, createEmptyModel());
  modalVisible.value = true;
}

function openEdit(row: ProjectItem) {
  editingId.value = row.id;
  Object.assign(model, {
    title: row.title ?? '',
    link: row.link ?? '',
    description: row.description ?? '',
    coverImagePath: row.coverImageUrl ?? '',
    videoPath: row.videoUrl ?? '',
    tags: joinTags(row.tags),
    sortOrder: row.sortOrder ?? 0,
    featured: Boolean(row.featured),
    published: row.published !== false
  });
  modalVisible.value = true;
}

async function handleUpload(event: Event, target: 'coverImagePath' | 'videoPath') {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;

  const category = target === 'coverImagePath' ? 'projects-cover' : 'projects-video';
  const asset = await upload(file, category);

  if (asset) {
    model[target] = asset.relativePath;
    window.$message?.success('上传成功');
  }
}

async function handleCoverUpload(event: Event) {
  await handleUpload(event, 'coverImagePath');
}

async function handleVideoUpload(event: Event) {
  await handleUpload(event, 'videoPath');
}

async function handleSave() {
  if (!model.title.trim() || !model.link.trim()) {
    window.$message?.warning('标题和链接不能为空');
    return;
  }

  saving.value = true;

  const payload: ProjectPayload = {
    title: model.title.trim(),
    link: model.link.trim(),
    description: model.description.trim() || null,
    coverImagePath: model.coverImagePath.trim() || null,
    videoPath: model.videoPath.trim() || null,
    tags: splitTags(model.tags),
    featured: model.featured,
    published: model.published,
    sortOrder: model.sortOrder
  };

  const { error } =
    editingId.value === null ? await createProject(payload) : await updateProject(editingId.value, payload);

  saving.value = false;

  if (!error) {
    window.$message?.success('保存成功');
    modalVisible.value = false;
    await load();
  }
}

function handleDelete(row: ProjectItem) {
  window.$dialog?.warning({
    title: '删除确认',
    content: `确定删除「${row.title}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteProject(row.id);

      if (!error) {
        window.$message?.success('已删除');
        await load();
      }
    }
  });
}

const columns: DataTableColumns<ProjectItem> = [
  { title: '标题', key: 'title', minWidth: 160 },
  { title: '链接', key: 'link', minWidth: 220, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'published',
    width: 90,
    render: row =>
      h(
        NTag,
        { size: 'small', type: row.published ? 'success' : 'default' },
        { default: () => (row.published ? '已发布' : '隐藏') }
      )
  },
  { title: '精选', key: 'featured', width: 80, render: row => (row.featured ? '是' : '否') },
  { title: '排序', key: 'sortOrder', width: 80 },
  {
    title: '操作',
    key: 'operate',
    width: 140,
    align: 'center',
    render: row =>
      h(
        NSpace,
        { justify: 'center', size: 8 },
        {
          default: () => [
            h(NButton, { text: true, type: 'primary', onClick: () => openEdit(row) }, { default: () => '编辑' }),
            h(NButton, { text: true, type: 'error', onClick: () => handleDelete(row) }, { default: () => '删除' })
          ]
        }
      )
  }
];
</script>

<template>
  <div>
    <NCard title="项目管理" :bordered="false">
    <template #header-extra>
      <NButton type="primary" @click="openCreate">新增项目</NButton>
    </template>

    <NDataTable :columns="columns" :data="items" :loading="loading" :row-key="rowKey" />
  </NCard>

  <NModal
    v-model:show="modalVisible"
    preset="card"
    :title="editingId === null ? '新增项目' : '编辑项目'"
    style="width: 720px"
  >
    <NForm label-placement="top">
      <NFormItem label="标题" required>
        <NInput v-model:value="model.title" placeholder="项目标题" />
      </NFormItem>
      <NFormItem label="链接" required>
        <NInput v-model:value="model.link" placeholder="https://example.com" />
      </NFormItem>
      <NFormItem label="描述">
        <NInput v-model:value="model.description" type="textarea" :rows="3" placeholder="项目简介" />
      </NFormItem>
      <NFormItem label="封面">
        <NSpace vertical class="w-full">
          <NInput v-model:value="model.coverImagePath" placeholder="上传后自动填入，也可手动填写相对路径" />
          <NSpace align="center">
            <NButton :loading="uploading" @click="coverInput?.click()">上传图片</NButton>
            <span class="text-12px text-gray-500">{{ model.coverImagePath }}</span>
          </NSpace>
        </NSpace>
      </NFormItem>
      <NFormItem label="视频">
        <NSpace vertical class="w-full">
          <NInput v-model:value="model.videoPath" placeholder="上传后自动填入，也可手动填写相对路径" />
          <NSpace align="center">
            <NButton :loading="uploading" @click="videoInput?.click()">上传视频</NButton>
            <span class="text-12px text-gray-500">{{ model.videoPath }}</span>
          </NSpace>
        </NSpace>
      </NFormItem>
      <NFormItem label="标签（逗号分隔）">
        <NInput v-model:value="model.tags" placeholder="Java, Spring Boot" />
      </NFormItem>
      <NFormItem label="排序">
        <NInputNumber v-model:value="model.sortOrder" :min="0" />
      </NFormItem>
      <NSpace :size="24">
        <NSpace align="center" :size="8">
          <NSwitch v-model:value="model.featured" />
          <span>精选</span>
        </NSpace>
        <NSpace align="center" :size="8">
          <NSwitch v-model:value="model.published" />
          <span>对外展示</span>
        </NSpace>
      </NSpace>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="modalVisible = false">取消</NButton>
        <NButton type="primary" :loading="saving" @click="handleSave">保存</NButton>
      </NSpace>
    </template>
  </NModal>

  <input ref="coverInput" type="file" accept="image/*" style="display: none" @change="handleCoverUpload" />
  <input ref="videoInput" type="file" accept="video/*" style="display: none" @change="handleVideoUpload" />
  </div>
</template>

<style scoped></style>
