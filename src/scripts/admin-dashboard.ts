import type { BlogPost, Profile, Project, Work } from "@/lib/apiClient";
import { runtimeConfig } from "@/lib/runtime-config";

type MediaAsset = {
	relativePath: string;
	publicUrl: string;
	originalFilename: string;
	mimeType?: string;
	sizeInBytes?: number;
};

type StatusType = "info" | "success" | "error";
type EntityType = "project" | "post" | "work";

type AdminState = {
	token: string;
	projects: Project[];
	posts: BlogPost[];
	works: Work[];
	profile: Profile | null;
};

const state: AdminState = {
	token: "",
	projects: [],
	posts: [],
	works: [],
	profile: null,
};

const storageKey = "portfolio-admin-token";
const mediaBase = runtimeConfig.mediaBaseUrl.replace(/\/$/, "");
const TOKEN_DEBOUNCE_MS = 400;

let initialized = false;

/** 列表里的数据来自后端，必须转义后再拼进 innerHTML。 */
function escapeHtml(value: string): string {
	return value
		.replace(/&/g, "&amp;")
		.replace(/</g, "&lt;")
		.replace(/>/g, "&gt;")
		.replace(/"/g, "&quot;")
		.replace(/'/g, "&#39;");
}

function setUploadStatus(selector: string, message: string) {
	const el = document.querySelector(selector) as HTMLElement | null;
	if (el) {
		el.textContent = message;
	}
}

function setStatus(message: string, type: StatusType = "info") {
	const box = document.getElementById("admin-status");
	if (!box) return;
	box.textContent = message;
	box.dataset.status = type;
}

function ensureToken() {
	if (!state.token) {
		throw new Error("请先填写后台 Token");
	}
}

function toRelativePath(url?: string | null): string {
	if (!url) return "";
	let normalized = url.trim().replace(/\/$/, "");
	while (normalized.startsWith(mediaBase)) {
		normalized = normalized.slice(mediaBase.length);
		normalized = normalized.replace(/^\/+/, "");
	}
	const marker = "/api/files/";
	const markerIndex = normalized.lastIndexOf(marker);
	if (markerIndex !== -1) {
		normalized = normalized.slice(markerIndex + marker.length);
	}
	return normalized.replace(/^\/+/, "");
}

async function adminFetch<T>(path: string, init: RequestInit = {}): Promise<T> {
	ensureToken();
	const response = await fetch(`${runtimeConfig.adminApiBaseUrl}${path}`, {
		cache: "no-store",
		...init,
		headers: {
			"Content-Type": "application/json",
			"X-ADMIN-TOKEN": state.token,
			...(init.headers || {}),
		},
	});

	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || `请求失败: ${response.status}`);
	}

	// 204 或空响应体（例如尚未配置个人信息时的 GET /profile）没有 JSON 可解析。
	const body = await response.text();
	if (!body) return null as T;
	return JSON.parse(body) as T;
}

function resetForm(form: HTMLFormElement) {
	form.reset();
	const idInput = form.elements.namedItem("id") as HTMLInputElement | null;
	if (idInput) {
		idInput.value = "";
	}
}

function tagsToString(tags?: string[]) {
	return tags?.length ? tags.join(", ") : "";
}

function stringToTags(value?: string | null) {
	if (!value) return [] as string[];
	return value
		.split(",")
		.map((item) => item.trim())
		.filter(Boolean);
}

function errorMessage(error: unknown): string {
	return error instanceof Error ? error.message : String(error);
}

function requireInput(form: HTMLFormElement, name: string): HTMLInputElement {
	const element = form.elements.namedItem(name);
	if (!(element instanceof HTMLInputElement)) {
		throw new Error(`表单缺少输入框: ${name}`);
	}
	return element;
}

function requireTextarea(form: HTMLFormElement, name: string): HTMLTextAreaElement {
	const element = form.elements.namedItem(name);
	if (!(element instanceof HTMLTextAreaElement)) {
		throw new Error(`表单缺少文本域: ${name}`);
	}
	return element;
}

/* ------------------------------------------------------------------ */
/* 列表渲染                                                             */
/* ------------------------------------------------------------------ */

const LIST_LIMIT = 5;

type ListRow = { id: number; title: string; subtitle?: string; status?: string; extra?: string };

function renderList(containerId: string, items: ListRow[], type: EntityType) {
	const container = document.getElementById(containerId);
	if (!container) return;

	if (!items.length) {
		container.innerHTML = `<p class="admin-list-empty">暂无数据，先新增一条吧。</p>`;
		return;
	}

	const showAll = container.dataset.showAll === "true";
	const displayItems = showAll ? items : items.slice(0, LIST_LIMIT);
	const hasMore = items.length > LIST_LIMIT;

	const rows = displayItems
		.map(
			(item) => `
        <tr data-entity="${type}" data-id="${item.id}">
          <td>
            <div class="admin-cell-title">${escapeHtml(item.title)}</div>
            ${
							item.subtitle
								? `<div class="admin-cell-subtitle" title="${escapeHtml(item.subtitle)}">${escapeHtml(
										item.subtitle,
									)}</div>`
								: ""
						}
          </td>
          <td>${escapeHtml(item.status || "")}</td>
          <td>${escapeHtml(item.extra || "")}</td>
          <td>
            <div class="admin-table-actions">
              <button type="button" data-edit-${type}="${item.id}">编辑</button>
              <button type="button" data-delete-${type}="${item.id}">删除</button>
            </div>
          </td>
        </tr>
      `,
		)
		.join("");

	const toggleButton = hasMore
		? `<button type="button" class="admin-link-button" data-toggle-show-all="${type}">${
				showAll ? "收起" : "显示全部"
			}</button>`
		: "";

	container.innerHTML = `
    <div class="admin-list-meta">
      <span>共 ${items.length} 条${showAll ? "" : `，显示前 ${displayItems.length} 条`}</span>
      ${toggleButton}
    </div>
    <div class="admin-table-wrapper">
      <table class="admin-table">
        <thead>
          <tr>
            <th>标题</th>
            <th>状态</th>
            <th>备注</th>
            <th>操作</th>
          </tr>
        </thead>
        <tbody>${rows}</tbody>
      </table>
    </div>
  `;
}

/* ------------------------------------------------------------------ */
/* 数据加载                                                             */
/* ------------------------------------------------------------------ */

async function loadProfile() {
	try {
		const profile = await adminFetch<Profile | null>("/profile");
		state.profile = profile;
		const form = document.getElementById("profile-form") as HTMLFormElement | null;
		if (!form) return;
		if (!profile) {
			setUploadStatus("#profile-hero-status", "尚未上传");
			setUploadStatus("#profile-resume-status", "尚未上传");
			return;
		}
		requireInput(form, "fullName").value = profile.fullName ?? "";
		requireInput(form, "headline").value = profile.headline ?? "";
		requireTextarea(form, "bio").value = profile.bio ?? "";
		requireInput(form, "email").value = profile.email ?? "";
		requireInput(form, "phone").value = profile.phone ?? "";
		requireInput(form, "wechat").value = profile.wechat ?? "";
		requireInput(form, "location").value = profile.location ?? "";
		requireInput(form, "jobTitle").value = profile.jobTitle ?? "";
		requireInput(form, "heroImagePath").value = toRelativePath(profile.heroImageUrl);
		requireInput(form, "resumePath").value = toRelativePath(profile.resumeUrl);
		requireInput(form, "primaryCtaLabel").value = profile.primaryCtaLabel ?? "";
		requireInput(form, "primaryCtaLink").value = profile.primaryCtaLink ?? "";
		requireInput(form, "secondaryCtaLabel").value = profile.secondaryCtaLabel ?? "";
		requireInput(form, "secondaryCtaLink").value = profile.secondaryCtaLink ?? "";
		setUploadStatus(
			"#profile-hero-status",
			profile.heroImageUrl ? `已关联：${toRelativePath(profile.heroImageUrl)}` : "尚未上传",
		);
		setUploadStatus(
			"#profile-resume-status",
			profile.resumeUrl ? `已关联：${toRelativePath(profile.resumeUrl)}` : "尚未上传",
		);
	} catch (error) {
		setStatus(errorMessage(error), "error");
	}
}

async function loadProjects() {
	try {
		const projects = await adminFetch<Project[]>("/projects");
		state.projects = projects;
		renderList(
			"projects-list",
			projects.map((project) => ({
				id: project.id,
				title: project.title,
				subtitle: project.link,
				status: project.published ? "已发布" : "隐藏",
				extra: project.featured ? "精选" : "",
			})),
			"project",
		);
	} catch (error) {
		setStatus(errorMessage(error), "error");
	}
}

async function loadPosts() {
	try {
		const posts = await adminFetch<BlogPost[]>("/blog-posts");
		state.posts = posts;
		renderList(
			"posts-list",
			posts.map((post) => ({
				id: post.id,
				title: post.title,
				subtitle: post.slug,
				status: post.published ? "已发布" : "草稿",
				extra: post.featured ? "精选" : "",
			})),
			"post",
		);
	} catch (error) {
		setStatus(errorMessage(error), "error");
	}
}

async function loadWorks() {
	try {
		const works = await adminFetch<Work[]>("/works");
		state.works = works;
		renderList(
			"works-list",
			works.map((work) => ({
				id: work.id,
				title: work.name,
				subtitle: work.url,
				status: work.isShow ? "显示" : "隐藏",
				extra: `排序: ${work.sortOrder ?? 0}`,
			})),
			"work",
		);
	} catch (error) {
		setStatus(errorMessage(error), "error");
	}
}

/** 每个后台页只加载自己需要的数据，避免一次请求四个接口。 */
function loadCurrentPage() {
	if (document.getElementById("profile-form")) void loadProfile();
	if (document.getElementById("projects-list")) void loadProjects();
	if (document.getElementById("posts-list")) void loadPosts();
	if (document.getElementById("works-list")) void loadWorks();
}

/* ------------------------------------------------------------------ */
/* 表单回填                                                             */
/* ------------------------------------------------------------------ */

function fillProjectForm(id: number) {
	const project = state.projects.find((item) => item.id === id);
	const form = document.getElementById("project-form") as HTMLFormElement | null;
	if (!project || !form) return;
	requireInput(form, "id").value = String(project.id ?? "");
	requireInput(form, "title").value = project.title ?? "";
	requireInput(form, "link").value = project.link ?? "";
	requireTextarea(form, "description").value = project.description ?? "";
	requireInput(form, "coverImagePath").value = toRelativePath(project.coverImageUrl);
	requireInput(form, "videoPath").value = toRelativePath(project.videoUrl);
	requireInput(form, "tags").value = tagsToString(project.tags);
	requireInput(form, "sortOrder").value = String(project.sortOrder ?? 0);
	requireInput(form, "featured").checked = Boolean(project.featured);
	requireInput(form, "published").checked = project.published !== false;
	setUploadStatus(
		"#project-cover-status",
		project.coverImageUrl ? `已关联：${toRelativePath(project.coverImageUrl)}` : "尚未上传",
	);
	setUploadStatus(
		"#project-video-status",
		project.videoUrl ? `已关联：${toRelativePath(project.videoUrl)}` : "尚未上传",
	);
}

function fillPostForm(id: number) {
	const post = state.posts.find((item) => item.id === id);
	const form = document.getElementById("post-form") as HTMLFormElement | null;
	if (!post || !form) return;
	requireInput(form, "id").value = String(post.id ?? "");
	requireInput(form, "title").value = post.title ?? "";
	requireInput(form, "slug").value = post.slug ?? "";
	requireTextarea(form, "summary").value = post.summary ?? "";
	requireTextarea(form, "content").value = post.content ?? "";
	requireInput(form, "coverImagePath").value = toRelativePath(post.coverImageUrl);
	if (post.publishDate) {
		requireInput(form, "publishDate").value = new Date(post.publishDate).toISOString().slice(0, 16);
	}
	requireInput(form, "tags").value = tagsToString(post.tags);
	requireInput(form, "featured").checked = Boolean(post.featured);
	requireInput(form, "published").checked = post.published !== false;
	setUploadStatus(
		"#post-cover-status",
		post.coverImageUrl ? `已关联：${toRelativePath(post.coverImageUrl)}` : "尚未上传",
	);
	if (post.content) {
		setUploadStatus("#post-markdown-status", "已载入当前文章内容，可重新选择 Markdown 文件覆盖");
	}
}

function fillWorkForm(id: number) {
	const work = state.works.find((item) => item.id === id);
	const form = document.getElementById("work-form") as HTMLFormElement | null;
	if (!work || !form) return;
	requireInput(form, "id").value = String(work.id ?? "");
	requireInput(form, "name").value = work.name ?? "";
	requireInput(form, "url").value = work.url ?? "";
	requireTextarea(form, "description").value = work.description ?? "";
	requireInput(form, "imagePath").value = toRelativePath(work.imageUrl);
	requireInput(form, "videoPath").value = toRelativePath(work.videoUrl);
	requireInput(form, "tags").value = tagsToString(work.tags);
	requireInput(form, "sortOrder").value = String(work.sortOrder ?? 0);
	requireInput(form, "isShow").checked = work.isShow !== false;
	setUploadStatus(
		"#work-image-status",
		work.imageUrl ? `已关联：${toRelativePath(work.imageUrl)}` : "尚未上传",
	);
	setUploadStatus(
		"#work-video-status",
		work.videoUrl ? `已关联：${toRelativePath(work.videoUrl)}` : "尚未上传",
	);
}

/* ------------------------------------------------------------------ */
/* 增删改                                                               */
/* ------------------------------------------------------------------ */

const ENTITY_META: Record<EntityType, { name: string; endpoint: string; reload: () => Promise<void> }> = {
	project: { name: "项目", endpoint: "projects", reload: loadProjects },
	post: { name: "文章", endpoint: "blog-posts", reload: loadPosts },
	work: { name: "作品", endpoint: "works", reload: loadWorks },
};

async function deleteEntity(type: EntityType, id: number) {
	const meta = ENTITY_META[type];
	if (!window.confirm(`确定删除该${meta.name}吗？`)) return;
	try {
		await adminFetch(`/${meta.endpoint}/${id}`, { method: "DELETE" });
		setStatus("删除成功", "success");
		await meta.reload();
	} catch (error) {
		setStatus(errorMessage(error), "error");
	}
}

type FormHandler = {
	formId: string;
	endpoint: string;
	/** 从表单读出一条记录，转成后端需要的 JSON */
	buildPayload: (formData: FormData, form: HTMLFormElement) => unknown;
	successMessage: string;
	reload: () => Promise<void>;
	resetSelector: string;
	/** profile 是单例 upsert，后端只提供 PUT，不能按有无 id 在 POST/PUT 间切换 */
	forcePut?: boolean;
};

function bindForm(handler: FormHandler) {
	const form = document.getElementById(handler.formId) as HTMLFormElement | null;
	if (!form) return;

	form.addEventListener("submit", async (event) => {
		event.preventDefault();
		try {
			const formData = new FormData(form);
			const body = JSON.stringify(handler.buildPayload(formData, form));
			if (handler.forcePut) {
				await adminFetch(`/${handler.endpoint}`, { method: "PUT", body });
			} else {
				const id = formData.get("id")?.toString();
				if (id) {
					await adminFetch(`/${handler.endpoint}/${id}`, { method: "PUT", body });
				} else {
					await adminFetch(`/${handler.endpoint}`, { method: "POST", body });
				}
			}
			setStatus(handler.successMessage, "success");
			// profile 是单例 upsert，保存后保留表单内容便于继续微调；其余实体保存后清空进入新增状态。
			if (!handler.forcePut) resetForm(form);
			await handler.reload();
		} catch (error) {
			setStatus(errorMessage(error), "error");
		}
	});

	document.querySelector(handler.resetSelector)?.addEventListener("click", () => resetForm(form));
}

function bindList(containerId: string, type: EntityType, fillForm: (id: number) => void) {
	const container = document.getElementById(containerId);
	if (!container) return;

	container.addEventListener("click", async (event) => {
		const target = event.target as HTMLElement;

		if (target.closest("[data-toggle-show-all]")) {
			container.dataset.showAll = container.dataset.showAll === "true" ? "false" : "true";
			await ENTITY_META[type].reload();
			return;
		}

		const editButton = target.closest<HTMLElement>(`[data-edit-${type}]`);
		if (editButton) {
			const id = Number(editButton.getAttribute(`data-edit-${type}`));
			fillForm(id);
			setStatus("已载入到表单", "info");
			return;
		}

		const deleteButton = target.closest<HTMLElement>(`[data-delete-${type}]`);
		if (deleteButton) {
			await deleteEntity(type, Number(deleteButton.getAttribute(`data-delete-${type}`)));
		}
	});
}

/* ------------------------------------------------------------------ */
/* 文件上传                                                             */
/* ------------------------------------------------------------------ */

async function uploadMediaFile(formData: FormData): Promise<MediaAsset> {
	ensureToken();
	const response = await fetch(`${runtimeConfig.adminApiBaseUrl}/media/upload`, {
		method: "POST",
		headers: { "X-ADMIN-TOKEN": state.token },
		body: formData,
	});
	if (!response.ok) {
		const text = await response.text();
		throw new Error(text || `上传失败: ${response.status}`);
	}
	return (await response.json()) as MediaAsset;
}

function setupUploaders() {
	const mediaInputs = document.querySelectorAll<HTMLInputElement>("[data-upload-target]");
	for (const input of mediaInputs) {
		input.addEventListener("change", async () => {
			const file = input.files?.[0];
			if (!file) return;
			if (!state.token) {
				setStatus("请先输入后台 Token 再上传文件", "error");
				input.value = "";
				return;
			}
			const targetName = input.dataset.uploadTarget || "";
			const category = input.dataset.uploadCategory || "misc";
			const statusEl = input.dataset.uploadStatus
				? (document.querySelector(input.dataset.uploadStatus) as HTMLElement | null)
				: null;
			if (statusEl) statusEl.textContent = "上传中…";
			try {
				const formData = new FormData();
				formData.append("file", file);
				formData.append("category", category);
				const asset = await uploadMediaFile(formData);
				const hidden = input.form?.elements.namedItem(targetName) as HTMLInputElement | null;
				if (hidden) {
					hidden.value = asset.relativePath;
				}
				if (statusEl) statusEl.textContent = `已上传：${asset.relativePath}`;
			} catch (error) {
				if (statusEl) statusEl.textContent = "上传失败";
				setStatus(errorMessage(error), "error");
			}
		});
	}

	const markdownInputs = document.querySelectorAll<HTMLInputElement>("[data-markdown-target]");
	for (const input of markdownInputs) {
		const statusEl = input.dataset.uploadStatus
			? (document.querySelector(input.dataset.uploadStatus) as HTMLElement | null)
			: null;
		input.addEventListener("change", async () => {
			const file = input.files?.[0];
			if (!file) return;
			const textarea = input.form?.elements.namedItem(
				input.dataset.markdownTarget || "",
			) as HTMLTextAreaElement | null;
			if (!textarea) return;
			if (statusEl) statusEl.textContent = "读取 Markdown 中…";
			const reader = new FileReader();
			reader.onload = () => {
				textarea.value = typeof reader.result === "string" ? reader.result : "";
				if (statusEl) statusEl.textContent = `已读取：${file.name}`;
			};
			reader.onerror = () => {
				if (statusEl) statusEl.textContent = "读取失败";
			};
			reader.readAsText(file, "utf-8");
		});
	}
}

function setupUploadForm() {
	const uploadForm = document.getElementById("upload-form") as HTMLFormElement | null;
	if (!uploadForm) return;

	uploadForm.addEventListener("submit", async (event) => {
		event.preventDefault();
		try {
			const formData = new FormData(uploadForm);
			const asset = await uploadMediaFile(formData);
			const resultBox = document.getElementById("upload-result");
			if (resultBox) {
				resultBox.innerHTML = `上传成功，可引用路径：<code>${escapeHtml(asset.relativePath)}</code>
          <br />完整 URL：<a href="${escapeHtml(
						asset.publicUrl,
					)}" target="_blank" rel="noopener">${escapeHtml(asset.publicUrl)}</a>`;
			}
			uploadForm.reset();
			setStatus("文件上传成功", "success");
		} catch (error) {
			setStatus(errorMessage(error), "error");
		}
	});
}

/* ------------------------------------------------------------------ */
/* 初始化                                                               */
/* ------------------------------------------------------------------ */

export default function initAdminDashboard() {
	if (typeof window === "undefined" || initialized) return;
	const tokenInput = document.getElementById("admin-token") as HTMLInputElement | null;
	if (!tokenInput) return;
	initialized = true;

	setupUploaders();
	setupUploadForm();

	bindForm({
		formId: "profile-form",
		endpoint: "profile",
		resetSelector: "[data-reset-profile]",
		forcePut: true,
		successMessage: "个人信息已更新",
		reload: loadProfile,
		buildPayload: (formData) => ({
			fullName: formData.get("fullName")?.toString().trim(),
			headline: formData.get("headline")?.toString().trim(),
			bio: formData.get("bio")?.toString().trim(),
			email: formData.get("email")?.toString().trim(),
			phone: formData.get("phone")?.toString().trim(),
			wechat: formData.get("wechat")?.toString().trim(),
			location: formData.get("location")?.toString().trim(),
			jobTitle: formData.get("jobTitle")?.toString().trim(),
			heroImagePath: formData.get("heroImagePath")?.toString().trim(),
			resumePath: formData.get("resumePath")?.toString().trim(),
			primaryCtaLabel: formData.get("primaryCtaLabel")?.toString().trim(),
			primaryCtaLink: formData.get("primaryCtaLink")?.toString().trim(),
			secondaryCtaLabel: formData.get("secondaryCtaLabel")?.toString().trim(),
			secondaryCtaLink: formData.get("secondaryCtaLink")?.toString().trim(),
		}),
	});

	bindForm({
		formId: "project-form",
		endpoint: "projects",
		resetSelector: "[data-reset-project]",
		successMessage: "项目已保存",
		reload: loadProjects,
		buildPayload: (formData, form) => ({
			title: formData.get("title")?.toString().trim(),
			link: formData.get("link")?.toString().trim(),
			description: formData.get("description")?.toString().trim(),
			coverImagePath: formData.get("coverImagePath")?.toString().trim(),
			videoPath: formData.get("videoPath")?.toString().trim(),
			tags: stringToTags(formData.get("tags")?.toString()),
			sortOrder: Number(formData.get("sortOrder") || 0),
			featured: (form.elements.namedItem("featured") as HTMLInputElement).checked,
			published: (form.elements.namedItem("published") as HTMLInputElement).checked,
		}),
	});

	bindForm({
		formId: "post-form",
		endpoint: "blog-posts",
		resetSelector: "[data-reset-post]",
		successMessage: "文章已保存",
		reload: loadPosts,
		buildPayload: (formData, form) => {
			const publishValue = formData.get("publishDate")?.toString();
			return {
				title: formData.get("title")?.toString().trim(),
				slug: formData.get("slug")?.toString().trim(),
				summary: formData.get("summary")?.toString().trim(),
				content: formData.get("content")?.toString(),
				coverImagePath: formData.get("coverImagePath")?.toString().trim(),
				publishDate: publishValue ? new Date(publishValue).toISOString() : new Date().toISOString(),
				tags: stringToTags(formData.get("tags")?.toString()),
				featured: (form.elements.namedItem("featured") as HTMLInputElement).checked,
				published: (form.elements.namedItem("published") as HTMLInputElement).checked,
			};
		},
	});

	bindForm({
		formId: "work-form",
		endpoint: "works",
		resetSelector: "[data-reset-work]",
		successMessage: "作品已保存",
		reload: loadWorks,
		buildPayload: (formData, form) => ({
			name: formData.get("name")?.toString().trim(),
			url: formData.get("url")?.toString().trim(),
			description: formData.get("description")?.toString().trim(),
			imagePath: formData.get("imagePath")?.toString().trim(),
			videoPath: formData.get("videoPath")?.toString().trim(),
			tags: stringToTags(formData.get("tags")?.toString()),
			sortOrder: Number(formData.get("sortOrder") || 0),
			isShow: (form.elements.namedItem("isShow") as HTMLInputElement).checked,
		}),
	});

	bindList("projects-list", "project", fillProjectForm);
	bindList("posts-list", "post", fillPostForm);
	bindList("works-list", "work", fillWorkForm);

	state.token = localStorage.getItem(storageKey) || "";
	if (state.token) {
		tokenInput.value = state.token;
		loadCurrentPage();
	}

	let tokenTimer: number | undefined;
	tokenInput.addEventListener("input", () => {
		state.token = tokenInput.value.trim();
		if (state.token) {
			localStorage.setItem(storageKey, state.token);
		} else {
			localStorage.removeItem(storageKey);
		}
		// 输入过程中不要每个字符都打一轮请求
		window.clearTimeout(tokenTimer);
		if (!state.token) return;
		tokenTimer = window.setTimeout(() => loadCurrentPage(), TOKEN_DEBOUNCE_MS);
	});
}
