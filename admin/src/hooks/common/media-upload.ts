import { ref } from 'vue';
import { uploadMedia, type MediaAsset } from '@/service/api/portfolio';

/**
 * 上传媒体文件并把 loading 状态收敛到一处。
 * 失败提示由请求层的 showErrorMsg 统一处理，这里只返回 null。
 */
export function useMediaUpload(defaultCategory: string) {
  const uploading = ref(false);

  async function upload(file: File, category = defaultCategory): Promise<MediaAsset | null> {
    uploading.value = true;

    try {
      const { data, error } = await uploadMedia(file, category);

      return error ? null : data;
    } finally {
      uploading.value = false;
    }
  }

  return {
    uploading,
    upload
  };
}

/** 把逗号分隔的字符串转成标签数组 */
export function splitTags(value: string): string[] {
  return value
    .split(',')
    .map(item => item.trim())
    .filter(Boolean);
}

/** 把标签数组转成逗号分隔的字符串 */
export function joinTags(tags?: string[] | null): string {
  return tags?.length ? tags.join(', ') : '';
}
