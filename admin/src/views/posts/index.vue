<script setup lang="ts">
import { h, onMounted, reactive, ref } from 'vue';
import {
  NButton,
  NCard,
  NDataTable,
  NDatePicker,
  NForm,
  NFormItem,
  NInput,
  NModal,
  NSpace,
  NSwitch,
  NTag,
  type DataTableColumns
} from 'naive-ui';
import {
  createPost,
  deletePost,
  fetchPosts,
  updatePost,
  type BlogPostItem,
  type BlogPostPayload
} from '@/service/api/portfolio';
import { joinTags, splitTags, useMediaUpload } from '@/hooks/common/media-upload';

defineOptions({ name: 'Posts' });

interface FormModel {
  title: string;
  slug: string;
  summary: string;
  content: string;
  coverImagePath: string;
  publishTimestamp: number | null;
  tags: string;
  featured: boolean;
  published: boolean;
}

function createEmptyModel(): FormModel {
  return {
    title: '',
    slug: '',
    summary: '',
    content: '',
    coverImagePath: '',
    publishTimestamp: Date.now(),
    tags: '',
    featured: false,
    published: true
  };
}

const loading = ref(false);
const saving = ref(false);
const items = ref<BlogPostItem[]>([]);
const modalVisible = ref(false);
const editingId = ref<number | null>(null);
const model = reactive<FormModel>(createEmptyModel());

const coverInput = ref<HTMLInputElement | null>(null);
const { uploading, upload } = useMediaUpload('posts-cover');

const rowKey = (row: BlogPostItem) => row.id;

async function load() {
  loading.value = true;
  const { data } = await fetchPosts();
  if (data) items.value = data;
  loading.value = false;
}

onMounted(load);

function openCreate() {
  editingId.value = null;
  Object.assign(model, createEmptyModel());
  modalVisible.value = true;
}

function openEdit(row: BlogPostItem) {
  editingId.value = row.id;
  Object.assign(model, {
    title: row.title ?? '',
    slug: row.slug ?? '',
    summary: row.summary ?? '',
    content: row.content ?? '',
    coverImagePath: row.coverImageUrl ?? '',
    publishTimestamp: row.publishDate ? new Date(row.publishDate).getTime() : Date.now(),
    tags: joinTags(row.tags),
    featured: Boolean(row.featured),
    published: row.published !== false
  });
  modalVisible.value = true;
}

async function handleCoverUpload(event: Event) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;

  const asset = await upload(file);

  if (asset) {
    model.coverImagePath = asset.relativePath;
    window.$message?.success('上传成功');
  }
}

async function handleSave() {
  if (!model.title.trim() || !model.slug.trim()) {
    window.$message?.warning('标题和 Slug 不能为空');
    return;
  }

  saving.value = true;

  const payload: BlogPostPayload = {
    title: model.title.trim(),
    slug: model.slug.trim(),
    summary: model.summary.trim() || null,
    content: model.content,
    coverImagePath: model.coverImagePath.trim() || null,
    publishDate: new Date(model.publishTimestamp ?? Date.now()).toISOString(),
    tags: splitTags(model.tags),
    featured: model.featured,
    published: model.published
  };

  const { error } = editingId.value === null ? await createPost(payload) : await updatePost(editingId.value, payload);

  saving.value = false;

  if (!error) {
    window.$message?.success('保存成功');
    modalVisible.value = false;
    await load();
  }
}

function handleDelete(row: BlogPostItem) {
  window.$dialog?.warning({
    title: '删除确认',
    content: `确定删除「${row.title}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deletePost(row.id);

      if (!error) {
        window.$message?.success('已删除');
        await load();
      }
    }
  });
}

function formatDate(value?: string | null) {
  return value ? new Date(value).toLocaleString('zh-CN') : '-';
}

const columns: DataTableColumns<BlogPostItem> = [
  { title: '标题', key: 'title', minWidth: 180 },
  { title: 'Slug', key: 'slug', minWidth: 140, ellipsis: { tooltip: true } },
  {
    title: '状态',
    key: 'published',
    width: 90,
    render: row =>
      h(
        NTag,
        { size: 'small', type: row.published ? 'success' : 'default' },
        { default: () => (row.published ? '已发布' : '草稿') }
      )
  },
  { title: '发布时间', key: 'publishDate', width: 180, render: row => formatDate(row.publishDate) },
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
    <NCard title="文章管理" :bordered="false">
    <template #header-extra>
      <NButton type="primary" @click="openCreate">新增文章</NButton>
    </template>

    <NDataTable :columns="columns" :data="items" :loading="loading" :row-key="rowKey" />
  </NCard>

  <NModal
    v-model:show="modalVisible"
    preset="card"
    :title="editingId === null ? '新增文章' : '编辑文章'"
    style="width: 860px"
  >
    <NForm label-placement="top">
      <NSpace :size="16">
        <NFormItem label="标题" required class="flex-1">
          <NInput v-model:value="model.title" placeholder="文章标题" />
        </NFormItem>
        <NFormItem label="Slug（URL）" required class="flex-1">
          <NInput v-model:value="model.slug" placeholder="my-first-post" />
        </NFormItem>
      </NSpace>
      <NFormItem label="摘要">
        <NInput v-model:value="model.summary" type="textarea" :rows="2" placeholder="文章简介" />
      </NFormItem>
      <NFormItem label="Markdown 正文">
        <NInput v-model:value="model.content" type="textarea" :rows="12" placeholder="支持标准 Markdown 语法" />
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
      <NSpace :size="16">
        <NFormItem label="发布时间" class="flex-1">
          <NDatePicker v-model:value="model.publishTimestamp" type="datetime" class="w-full" />
        </NFormItem>
        <NFormItem label="标签（逗号分隔）" class="flex-1">
          <NInput v-model:value="model.tags" placeholder="Java, 教程" />
        </NFormItem>
      </NSpace>
      <NSpace :size="24">
        <NSpace align="center" :size="8">
          <NSwitch v-model:value="model.featured" />
          <span>精选</span>
        </NSpace>
        <NSpace align="center" :size="8">
          <NSwitch v-model:value="model.published" />
          <span>发布</span>
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
  </div>
</template>

<style scoped></style>
