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
  createWork,
  deleteWork,
  fetchWorks,
  updateWork,
  type WorkItem,
  type WorkPayload
} from '@/service/api/portfolio';
import { joinTags, splitTags, useMediaUpload } from '@/hooks/common/media-upload';

defineOptions({ name: 'Works' });

interface FormModel {
  name: string;
  url: string;
  description: string;
  imagePath: string;
  videoPath: string;
  tags: string;
  sortOrder: number;
  isShow: boolean;
}

function createEmptyModel(): FormModel {
  return {
    name: '',
    url: '',
    description: '',
    imagePath: '',
    videoPath: '',
    tags: '',
    sortOrder: 0,
    isShow: true
  };
}

const loading = ref(false);
const saving = ref(false);
const items = ref<WorkItem[]>([]);
const modalVisible = ref(false);
const editingId = ref<number | null>(null);
const model = reactive<FormModel>(createEmptyModel());

const imageInput = ref<HTMLInputElement | null>(null);
const videoInput = ref<HTMLInputElement | null>(null);
const { uploading, upload } = useMediaUpload('works-image');

const rowKey = (row: WorkItem) => row.id;

async function load() {
  loading.value = true;
  const { data } = await fetchWorks();
  if (data) items.value = data;
  loading.value = false;
}

onMounted(load);

function openCreate() {
  editingId.value = null;
  Object.assign(model, createEmptyModel());
  modalVisible.value = true;
}

function openEdit(row: WorkItem) {
  editingId.value = row.id;
  Object.assign(model, {
    name: row.name ?? '',
    url: row.url ?? '',
    description: row.description ?? '',
    imagePath: row.imageUrl ?? '',
    videoPath: row.videoUrl ?? '',
    tags: joinTags(row.tags),
    sortOrder: row.sortOrder ?? 0,
    isShow: row.isShow !== false
  });
  modalVisible.value = true;
}

async function handleUpload(event: Event, target: 'imagePath' | 'videoPath') {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;

  const category = target === 'imagePath' ? 'works-image' : 'works-video';
  const asset = await upload(file, category);

  if (asset) {
    model[target] = asset.relativePath;
    window.$message?.success('上传成功');
  }
}

async function handleImageUpload(event: Event) {
  await handleUpload(event, 'imagePath');
}

async function handleVideoUpload(event: Event) {
  await handleUpload(event, 'videoPath');
}

async function handleSave() {
  if (!model.name.trim() || !model.url.trim()) {
    window.$message?.warning('名称和链接不能为空');
    return;
  }

  saving.value = true;

  const payload: WorkPayload = {
    name: model.name.trim(),
    url: model.url.trim(),
    description: model.description.trim() || null,
    imagePath: model.imagePath.trim() || null,
    videoPath: model.videoPath.trim() || null,
    tags: splitTags(model.tags),
    isShow: model.isShow,
    sortOrder: model.sortOrder
  };

  const { error } = editingId.value === null ? await createWork(payload) : await updateWork(editingId.value, payload);

  saving.value = false;

  if (!error) {
    window.$message?.success('保存成功');
    modalVisible.value = false;
    await load();
  }
}

function handleDelete(row: WorkItem) {
  window.$dialog?.warning({
    title: '删除确认',
    content: `确定删除「${row.name}」吗？`,
    positiveText: '删除',
    negativeText: '取消',
    onPositiveClick: async () => {
      const { error } = await deleteWork(row.id);

      if (!error) {
        window.$message?.success('已删除');
        await load();
      }
    }
  });
}

const columns: DataTableColumns<WorkItem> = [
  { title: '名称', key: 'name', minWidth: 160 },
  { title: '链接', key: 'url', minWidth: 220, ellipsis: { tooltip: true } },
  {
    title: '显示',
    key: 'isShow',
    width: 90,
    render: row =>
      h(
        NTag,
        { size: 'small', type: row.isShow ? 'success' : 'default' },
        { default: () => (row.isShow ? '显示' : '隐藏') }
      )
  },
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
    <NCard title="作品管理" :bordered="false">
    <template #header-extra>
      <NButton type="primary" @click="openCreate">新增作品</NButton>
    </template>

    <NDataTable :columns="columns" :data="items" :loading="loading" :row-key="rowKey" />
  </NCard>

  <NModal
    v-model:show="modalVisible"
    preset="card"
    :title="editingId === null ? '新增作品' : '编辑作品'"
    style="width: 720px"
  >
    <NForm label-placement="top">
      <NFormItem label="名称" required>
        <NInput v-model:value="model.name" placeholder="作品名称" />
      </NFormItem>
      <NFormItem label="链接" required>
        <NInput v-model:value="model.url" placeholder="https://example.com" />
      </NFormItem>
      <NFormItem label="描述">
        <NInput v-model:value="model.description" type="textarea" :rows="3" placeholder="作品简介" />
      </NFormItem>
      <NFormItem label="图片">
        <NSpace vertical class="w-full">
          <NInput v-model:value="model.imagePath" placeholder="上传后自动填入，也可手动填写相对路径" />
          <NSpace align="center">
            <NButton :loading="uploading" @click="imageInput?.click()">上传图片</NButton>
            <span class="text-12px text-gray-500">{{ model.imagePath }}</span>
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
        <NInput v-model:value="model.tags" placeholder="设计, 开发" />
      </NFormItem>
      <NFormItem label="排序">
        <NInputNumber v-model:value="model.sortOrder" :min="0" />
      </NFormItem>
      <NSpace align="center" :size="8">
        <NSwitch v-model:value="model.isShow" />
        <span>对外显示</span>
      </NSpace>
    </NForm>

    <template #footer>
      <NSpace justify="end">
        <NButton @click="modalVisible = false">取消</NButton>
        <NButton type="primary" :loading="saving" @click="handleSave">保存</NButton>
      </NSpace>
    </template>
  </NModal>

  <input ref="imageInput" type="file" accept="image/*" style="display: none" @change="handleImageUpload" />
  <input ref="videoInput" type="file" accept="video/*" style="display: none" @change="handleVideoUpload" />
  </div>
</template>

<style scoped></style>
