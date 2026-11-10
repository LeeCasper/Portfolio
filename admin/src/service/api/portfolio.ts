import { request } from '../request';

/** 后端 DTO：响应字段使用 *Url，请求字段使用 *Path */
export interface BlogPostItem {
  id: number;
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  coverImageUrl?: string | null;
  publishDate?: string | null;
  featured: boolean;
  published: boolean;
  tags?: string[] | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface BlogPostPayload {
  title: string;
  slug: string;
  summary?: string | null;
  content?: string | null;
  coverImagePath?: string | null;
  publishDate: string;
  tags: string[];
  featured: boolean;
  published: boolean;
}

export interface WorkItem {
  id: number;
  name: string;
  description?: string | null;
  url: string;
  imageUrl?: string | null;
  videoUrl?: string | null;
  qrCodeUrl?: string | null;
  tags?: string[] | null;
  features?: string[] | null;
  isShow: boolean;
  sortOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export interface WorkPayload {
  name: string;
  url: string;
  description?: string | null;
  imagePath?: string | null;
  videoPath?: string | null;
  qrCodePath?: string | null;
  tags: string[];
  features: string[];
  isShow: boolean;
  sortOrder: number;
}

export interface ProfileItem {
  id: number;
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  wechat?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  heroImageUrl?: string | null;
  avatarUrl?: string | null;
  logoUrl?: string | null;
  resumeUrl?: string | null;
  icpNumber?: string | null;
  icpUrl?: string | null;
  icpIconUrl?: string | null;
  policeNumber?: string | null;
  policeUrl?: string | null;
  policeIconUrl?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaLink?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaLink?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ProfilePayload {
  fullName: string;
  headline?: string | null;
  bio?: string | null;
  email?: string | null;
  phone?: string | null;
  wechat?: string | null;
  location?: string | null;
  jobTitle?: string | null;
  heroImagePath?: string | null;
  avatarPath?: string | null;
  logoPath?: string | null;
  resumePath?: string | null;
  icpNumber?: string | null;
  icpUrl?: string | null;
  icpIconPath?: string | null;
  policeNumber?: string | null;
  policeUrl?: string | null;
  policeIconPath?: string | null;
  primaryCtaLabel?: string | null;
  primaryCtaLink?: string | null;
  secondaryCtaLabel?: string | null;
  secondaryCtaLink?: string | null;
}

export interface MediaAsset {
  id: number;
  originalFilename: string;
  relativePath: string;
  publicUrl: string;
  mimeType?: string;
  sizeInBytes?: number;
  category?: string;
  createdAt?: string;
}

/* ---------------- Blog posts ---------------- */

export function fetchPosts() {
  return request<BlogPostItem[]>({ url: '/api/admin/blog-posts' });
}

export function createPost(data: BlogPostPayload) {
  return request<BlogPostItem>({ url: '/api/admin/blog-posts', method: 'post', data });
}

export function updatePost(id: number, data: BlogPostPayload) {
  return request<BlogPostItem>({ url: `/api/admin/blog-posts/${id}`, method: 'put', data });
}

export function deletePost(id: number) {
  return request<void>({ url: `/api/admin/blog-posts/${id}`, method: 'delete' });
}

/* ---------------- Works ---------------- */

export function fetchWorks() {
  return request<WorkItem[]>({ url: '/api/admin/works' });
}

export function createWork(data: WorkPayload) {
  return request<WorkItem>({ url: '/api/admin/works', method: 'post', data });
}

export function updateWork(id: number, data: WorkPayload) {
  return request<WorkItem>({ url: `/api/admin/works/${id}`, method: 'put', data });
}

export function deleteWork(id: number) {
  return request<void>({ url: `/api/admin/works/${id}`, method: 'delete' });
}

/* ---------------- Profile ---------------- */

export function fetchProfile() {
  return request<ProfileItem | null>({ url: '/api/admin/profile' });
}

export function updateProfile(data: ProfilePayload) {
  return request<ProfileItem>({ url: '/api/admin/profile', method: 'put', data });
}

/* ---------------- Media ---------------- */

export function uploadMedia(file: File, category: string) {
  const formData = new FormData();
  formData.append('file', file);
  formData.append('category', category);

  return request<MediaAsset>({
    url: '/api/admin/media/upload',
    method: 'post',
    data: formData
  });
}
