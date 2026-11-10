<script setup lang="ts">
import { onMounted, reactive, ref } from 'vue';
import { NButton, NCard, NDivider, NForm, NFormItem, NGrid, NGridItem, NInput, NSpace } from 'naive-ui';
import { fetchProfile, updateProfile, type ProfileItem, type ProfilePayload } from '@/service/api/portfolio';
import { useMediaUpload } from '@/hooks/common/media-upload';

defineOptions({ name: 'Profile' });

interface FormModel {
  fullName: string;
  headline: string;
  bio: string;
  email: string;
  phone: string;
  wechat: string;
  location: string;
  jobTitle: string;
  heroImagePath: string;
  avatarPath: string;
  logoPath: string;
  resumePath: string;
  icpNumber: string;
  icpUrl: string;
  icpIconPath: string;
  policeNumber: string;
  policeUrl: string;
  policeIconPath: string;
  primaryCtaLabel: string;
  primaryCtaLink: string;
  secondaryCtaLabel: string;
  secondaryCtaLink: string;
}

function createEmptyModel(): FormModel {
  return {
    fullName: '',
    headline: '',
    bio: '',
    email: '',
    phone: '',
    wechat: '',
    location: '',
    jobTitle: '',
    heroImagePath: '',
    avatarPath: '',
    logoPath: '',
    resumePath: '',
    icpNumber: '',
    icpUrl: '',
    icpIconPath: '',
    policeNumber: '',
    policeUrl: '',
    policeIconPath: '',
    primaryCtaLabel: '',
    primaryCtaLink: '',
    secondaryCtaLabel: '',
    secondaryCtaLink: ''
  };
}

const loading = ref(false);
const saving = ref(false);
const model = reactive<FormModel>(createEmptyModel());

const heroInput = ref<HTMLInputElement | null>(null);
const avatarInput = ref<HTMLInputElement | null>(null);
const logoInput = ref<HTMLInputElement | null>(null);
const resumeInput = ref<HTMLInputElement | null>(null);
const icpIconInput = ref<HTMLInputElement | null>(null);
const policeIconInput = ref<HTMLInputElement | null>(null);

// 每个上传按钮独立 loading，避免一个文件上传时所有按钮一起转圈
const { uploading: uploadingHero, upload: uploadHero } = useMediaUpload('profile-hero');
const { uploading: uploadingAvatar, upload: uploadAvatar } = useMediaUpload('profile-avatar');
const { uploading: uploadingLogo, upload: uploadLogo } = useMediaUpload('profile-logo');
const { uploading: uploadingResume, upload: uploadResume } = useMediaUpload('profile-resume');
const { uploading: uploadingIcpIcon, upload: uploadIcpIcon } = useMediaUpload('profile-icp-icon');
const { uploading: uploadingPoliceIcon, upload: uploadPoliceIcon } = useMediaUpload('profile-police-icon');

// 图片预览（接口返回绝对地址，上传后直接用 publicUrl）
const previews = reactive({ heroImagePath: '', avatarPath: '', logoPath: '', icpIconPath: '', policeIconPath: '' });

function applyProfile(profile: ProfileItem) {
  Object.assign(model, {
    fullName: profile.fullName ?? '',
    headline: profile.headline ?? '',
    bio: profile.bio ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? '',
    wechat: profile.wechat ?? '',
    location: profile.location ?? '',
    jobTitle: profile.jobTitle ?? '',
    heroImagePath: profile.heroImageUrl ?? '',
    avatarPath: profile.avatarUrl ?? '',
    logoPath: profile.logoUrl ?? '',
    resumePath: profile.resumeUrl ?? '',
    icpNumber: profile.icpNumber ?? '',
    icpUrl: profile.icpUrl ?? '',
    icpIconPath: profile.icpIconUrl ?? '',
    policeNumber: profile.policeNumber ?? '',
    policeUrl: profile.policeUrl ?? '',
    policeIconPath: profile.policeIconUrl ?? '',
    primaryCtaLabel: profile.primaryCtaLabel ?? '',
    primaryCtaLink: profile.primaryCtaLink ?? '',
    secondaryCtaLabel: profile.secondaryCtaLabel ?? '',
    secondaryCtaLink: profile.secondaryCtaLink ?? ''
  });

  previews.heroImagePath = profile.heroImageUrl ?? '';
  previews.avatarPath = profile.avatarUrl ?? '';
  previews.logoPath = profile.logoUrl ?? '';
  previews.icpIconPath = profile.icpIconUrl ?? '';
  previews.policeIconPath = profile.policeIconUrl ?? '';
}

async function load() {
  loading.value = true;
  const { data } = await fetchProfile();

  // 尚未配置时后端返回空响应体，data 为空，保持空表单即可
  if (data && typeof data === 'object') {
    applyProfile(data);
  }

  loading.value = false;
}

onMounted(load);

type UploadTarget =
  | 'heroImagePath'
  | 'avatarPath'
  | 'logoPath'
  | 'resumePath'
  | 'icpIconPath'
  | 'policeIconPath';

const uploaders: Record<UploadTarget, (file: File) => ReturnType<typeof uploadHero>> = {
  heroImagePath: uploadHero,
  avatarPath: uploadAvatar,
  logoPath: uploadLogo,
  resumePath: uploadResume,
  icpIconPath: uploadIcpIcon,
  policeIconPath: uploadPoliceIcon
};

async function handleUpload(event: Event, target: UploadTarget) {
  const input = event.target as HTMLInputElement;
  const file = input.files?.[0];
  input.value = '';

  if (!file) return;

  const asset = await uploaders[target](file);

  if (asset) {
    model[target] = asset.relativePath;

    if (target !== 'resumePath') {
      previews[target] = asset.publicUrl;
    }

    window.$message?.success('上传成功');
  }
}

async function handleHeroUpload(event: Event) {
  await handleUpload(event, 'heroImagePath');
}

async function handleAvatarUpload(event: Event) {
  await handleUpload(event, 'avatarPath');
}

async function handleLogoUpload(event: Event) {
  await handleUpload(event, 'logoPath');
}

async function handleResumeUpload(event: Event) {
  await handleUpload(event, 'resumePath');
}

async function handleIcpIconUpload(event: Event) {
  await handleUpload(event, 'icpIconPath');
}

async function handlePoliceIconUpload(event: Event) {
  await handleUpload(event, 'policeIconPath');
}

async function handleSave() {
  if (!model.fullName.trim()) {
    window.$message?.warning('姓名不能为空');
    return;
  }

  saving.value = true;

  const payload: ProfilePayload = {
    fullName: model.fullName.trim(),
    headline: model.headline.trim() || null,
    bio: model.bio.trim() || null,
    email: model.email.trim() || null,
    phone: model.phone.trim() || null,
    wechat: model.wechat.trim() || null,
    location: model.location.trim() || null,
    jobTitle: model.jobTitle.trim() || null,
    heroImagePath: model.heroImagePath.trim() || null,
    avatarPath: model.avatarPath.trim() || null,
    logoPath: model.logoPath.trim() || null,
    resumePath: model.resumePath.trim() || null,
    icpNumber: model.icpNumber.trim() || null,
    icpUrl: model.icpUrl.trim() || null,
    icpIconPath: model.icpIconPath.trim() || null,
    policeNumber: model.policeNumber.trim() || null,
    policeUrl: model.policeUrl.trim() || null,
    policeIconPath: model.policeIconPath.trim() || null,
    primaryCtaLabel: model.primaryCtaLabel.trim() || null,
    primaryCtaLink: model.primaryCtaLink.trim() || null,
    secondaryCtaLabel: model.secondaryCtaLabel.trim() || null,
    secondaryCtaLink: model.secondaryCtaLink.trim() || null
  };

  const { error } = await updateProfile(payload);

  saving.value = false;

  if (!error) {
    window.$message?.success('个人信息已保存');
  }
}
</script>

<template>
  <div>
    <NCard title="个人信息" :bordered="false" :loading="loading">
    <NForm label-placement="top">
      <NGrid :cols="2" :x-gap="16">
        <NGridItem>
          <NFormItem label="姓名" required>
            <NInput v-model:value="model.fullName" placeholder="你的名字" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="标题">
            <NInput v-model:value="model.headline" placeholder="Java 后端开发工程师" />
          </NFormItem>
        </NGridItem>
        <NGridItem :span="2">
          <NFormItem label="个人简介">
            <NInput v-model:value="model.bio" type="textarea" :rows="4" placeholder="多段文字可用空行分隔" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="邮箱">
            <NInput v-model:value="model.email" placeholder="you@example.com" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="电话">
            <NInput v-model:value="model.phone" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="微信">
            <NInput v-model:value="model.wechat" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="所在地">
            <NInput v-model:value="model.location" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="职责 / 身份">
            <NInput v-model:value="model.jobTitle" placeholder="2026 届应届生" />
          </NFormItem>
        </NGridItem>
        <NGridItem :span="2">
          <NFormItem label="Hero 图">
            <NSpace vertical class="w-full">
              <div class="flex items-start gap-10px w-full">
                <div class="h-84px w-72px shrink-0 overflow-hidden rounded-6px border border-gray-200 bg-gray-50">
                  <img
                    v-if="previews.heroImagePath"
                    :src="previews.heroImagePath"
                    alt="Hero 预览"
                    class="h-full w-full object-cover"
                  />
                </div>
                <NSpace vertical class="w-full">
                  <NInput v-model:value="model.heroImagePath" placeholder="上传后自动填入，也可手动填写相对路径" />
                  <NSpace align="center">
                    <NButton :loading="uploadingHero" @click="heroInput?.click()">上传图片</NButton>
                    <span class="text-12px text-gray-500 break-all">{{ model.heroImagePath }}</span>
                  </NSpace>
                  <p class="text-12px text-gray-400">首页右侧的大卡片，建议竖版图片（约 6:7）</p>
                </NSpace>
              </div>
            </NSpace>
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="头像">
            <NSpace vertical class="w-full">
              <div class="flex items-start gap-10px w-full">
                <div class="h-56px w-56px shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                  <img
                    v-if="previews.avatarPath"
                    :src="previews.avatarPath"
                    alt="头像预览"
                    class="h-full w-full object-cover"
                  />
                </div>
                <NSpace vertical class="w-full">
                  <NInput v-model:value="model.avatarPath" placeholder="上传后自动填入" />
                  <NButton :loading="uploadingAvatar" @click="avatarInput?.click()">上传头像</NButton>
                  <p class="text-12px text-gray-400">「关于我」页面头像，建议正方形图片</p>
                </NSpace>
              </div>
            </NSpace>
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="站点 Logo">
            <NSpace vertical class="w-full">
              <div class="flex items-start gap-10px w-full">
                <div class="h-56px w-56px shrink-0 overflow-hidden rounded-full border border-gray-200 bg-gray-50">
                  <img
                    v-if="previews.logoPath"
                    :src="previews.logoPath"
                    alt="Logo 预览"
                    class="h-full w-full object-cover"
                  />
                </div>
                <NSpace vertical class="w-full">
                  <NInput v-model:value="model.logoPath" placeholder="上传后自动填入" />
                  <NButton :loading="uploadingLogo" @click="logoInput?.click()">上传 Logo</NButton>
                  <p class="text-12px text-gray-400">页面左上角与页脚，建议正方形图片</p>
                </NSpace>
              </div>
            </NSpace>
          </NFormItem>
        </NGridItem>
        <NGridItem :span="2">
          <NFormItem label="简历文件">
            <NSpace vertical class="w-full">
              <NInput v-model:value="model.resumePath" placeholder="支持 PDF / Markdown / 文本" />
              <NSpace align="center">
                <NButton :loading="uploadingResume" @click="resumeInput?.click()">上传简历</NButton>
                <span class="text-12px text-gray-500 break-all">{{ model.resumePath }}</span>
              </NSpace>
            </NSpace>
          </NFormItem>
        </NGridItem>
        <NGridItem :span="2">
          <NDivider title-placement="left">备案信息</NDivider>
        </NGridItem>
        <NGridItem :span="2">
          <NFormItem label="ICP 备案号">
            <NSpace vertical class="w-full">
              <NInput v-model:value="model.icpNumber" placeholder="例如：豫ICP备2024012345号" />
              <NInput v-model:value="model.icpUrl" placeholder="备案查询链接，留空默认 https://beian.miit.gov.cn/" />
              <NSpace align="center">
                <div class="flex h-40px w-40px shrink-0 items-center justify-center overflow-hidden rounded-4px border border-gray-200 bg-gray-50">
                  <img v-if="previews.icpIconPath" :src="previews.icpIconPath" alt="ICP 图标" class="h-full w-full object-contain" />
                </div>
                <NButton :loading="uploadingIcpIcon" @click="icpIconInput?.click()">上传 ICP 图标</NButton>
                <span class="text-12px text-gray-400">可选，不传则使用默认图标</span>
              </NSpace>
            </NSpace>
          </NFormItem>
        </NGridItem>
        <NGridItem :span="2">
          <NFormItem label="公安备案号">
            <NSpace vertical class="w-full">
              <NInput v-model:value="model.policeNumber" placeholder="例如：豫公网安备41150002001234号" />
              <NInput v-model:value="model.policeUrl" placeholder="公安备案查询链接，例如 https://beian.mps.gov.cn/..." />
              <NSpace align="center">
                <div class="flex h-40px w-40px shrink-0 items-center justify-center overflow-hidden rounded-4px border border-gray-200 bg-gray-50">
                  <img v-if="previews.policeIconPath" :src="previews.policeIconPath" alt="公安备案图标" class="h-full w-full object-contain" />
                </div>
                <NButton :loading="uploadingPoliceIcon" @click="policeIconInput?.click()">上传公安备案图标</NButton>
                <span class="text-12px text-gray-400">可选，不传则使用默认图标</span>
              </NSpace>
            </NSpace>
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="主按钮文案">
            <NInput v-model:value="model.primaryCtaLabel" placeholder="查看简历" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="主按钮链接">
            <NInput v-model:value="model.primaryCtaLink" placeholder="/about 或 https://..." />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="次按钮文案">
            <NInput v-model:value="model.secondaryCtaLabel" placeholder="联系我" />
          </NFormItem>
        </NGridItem>
        <NGridItem>
          <NFormItem label="次按钮链接">
            <NInput v-model:value="model.secondaryCtaLink" placeholder="mailto:you@example.com" />
          </NFormItem>
        </NGridItem>
      </NGrid>

      <NButton type="primary" :loading="saving" @click="handleSave">保存个人信息</NButton>
      <p class="mt-12px text-12px text-gray-500">
        社交链接不在后台维护，统一在 <code>src/collections/social.json</code> 中修改。
      </p>
    </NForm>
  </NCard>

  <input ref="heroInput" type="file" accept="image/*" style="display: none" @change="handleHeroUpload" />
  <input ref="avatarInput" type="file" accept="image/*" style="display: none" @change="handleAvatarUpload" />
  <input ref="logoInput" type="file" accept="image/*" style="display: none" @change="handleLogoUpload" />
  <input ref="resumeInput" type="file" accept=".pdf,.md,.txt" style="display: none" @change="handleResumeUpload" />
  <input ref="icpIconInput" type="file" accept="image/*" style="display: none" @change="handleIcpIconUpload" />
  <input ref="policeIconInput" type="file" accept="image/*" style="display: none" @change="handlePoliceIconUpload" />
  </div>
</template>

<style scoped></style>
